import { promises as fs } from "node:fs";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { type File as FormidableFile } from "formidable";
import { AVATAR_MAX_FILE_SIZE } from "@/lib/avatar/constants";
import { getNormalizedAvatarMimeType } from "@/lib/avatar/mime";
import { detectAvatarMimeTypeFromBuffer } from "@/lib/avatar/signature";
import { replaceUserAvatar } from "@/lib/avatar/storage.server";
import type { AvatarUploadResponse } from "@/types/avatar/upload";
import { getAccessToken } from "@/util";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import { getSupabaseServer } from "@/lib/supabase.server";

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET;

/*
  multipart/form-data
  - HTML form이나 FormData로 파일 + 텍스트를 같이 보낼 때 쓰는 인코딩 방식이야.
  - 본문이 boundary 기준으로 여러 “파트”로 나뉨.
  - 각 파트는 헤더 + 데이터 구조.
  - 예:
    파트 1: name="avatar" + 바이너리 파일
    파트 2: name="nickname" + 문자열
  - 브라우저가 FormData를 보내면 Content-Type: multipart/form-data; boundary=...를 자동으로 붙여줘.
*/
/*
  왜 bodyParser: false를 쓰는가
  - Next API Route 기본 bodyParser는 JSON/urlencoded 위주로 파싱해 req.body를 만들어줌.
  - 파일 업로드(multipart)는 별도 파서(formidable, multer)가 필요.
  - 중요한 점: 기본 parser가 먼저 body를 읽어버리면 스트림이 소모돼서 formidable.parse(req)가 제대로 못 읽음.
  - 그래서 bodyParser: false로 기본 파서를 끄고, formidable이 직접 req를 읽게 하는 거야.
*/
/*
  req가 req.body 자체냐?
  - 아니야. 완전히 다름.
  - req: 요청 전체 객체(method, headers, URL, body 스트림 포함)
  - req.body: 파싱된 바디 결과물(기본 parser가 켜져 있을 때)
  - bodyParser: false면 보통 req.body를 기대하면 안 되고, req 스트림을 직접 파싱해야 해.
*/
/*
  .parse(req, (error, _fields, files) => ...) 의미
  - formidable.parse가 req 스트림에서 multipart를 읽고 분해함.
  - error: 파싱 에러
  - _fields: 텍스트 필드들(여기선 안 써서 _ prefix)
  - files: 업로드 파일들 (files.avatar 등)
*/

// FormData 전송 -> 서버에서 req 수신 -> formidable.parse(req)로 fields/files 추출.

/*
  1. HTTP 기본
  - HTTP request/response
  - headers, Content-Type, Authorization
  - request body와 stream
  
  2. 브라우저 전송 API
  - FormData
  - fetch with file upload
  - Blob, File
  
  3. 멀티파트 포맷
  - multipart/form-data
  - boundary, part, Content-Disposition
  
  4. Node.js 서버 입력 처리
  - IncomingMessage(req 스트림)
  - buffer vs stream
  - 파일 업로드 파서(formidable, multer, busboy)
  
  5. Next.js API Route/Route Handler
  - pages/api의 config.api.bodyParser
  - App Router에서의 업로드 처리 차이(request.formData())
  
  6. 보안
  - MIME 검증/시그니처 검증
  - 파일 크기 제한
  - 인증 토큰 처리
  - 업로드 경로/권한 제어
*/
export const config = {
  api: {
    bodyParser: false,
  },
};

/*
  parseAvatarFile(req)의 resolve(avatarFile)
  - 여기서 받는 건 파일 자체 바이트가 아니라 FormidableFile 객체야.
  - 안에는 filepath, size, mimetype 같은 메타정보만 있어.
*/
/*
  fs.readFile(avatarFile.filepath)
  - 이 단계에서 실제 파일 바이트를 Buffer로 읽어.
  - 이 바이트가 있어야 시그니처 검사(PNG/JPEG 매직바이트 확인)
*/
/*
  - formidable은 기본적으로 업로드를 임시 디스크 파일로 받아서 메모리 폭주를 막고,
  - 파싱(요청 분해)과 내용 검증(바이트 검사)을 분리해 처리하기 좋기 때문이야.
  
  즉, resolve된 파일과 디스크 파일은 중복이 아니라 파일 정보 객체 vs 실제 파일 데이터 차이야.
*/

const parseAvatarFile = (req: NextApiRequest): Promise<FormidableFile> =>
  new Promise((resolve, reject) => {
    /*
      formidable 옵션 설정
      - multiples: false 파일 여러 개 금지
      - allowEmptyFiles: false 빈 파일 금지
      - maxFiles: 1 파일 1개만 허용
      - maxFileSize 최대 용량 제한
    */
    const form = formidable({
      multiples: false,
      allowEmptyFiles: false,
      maxFiles: 1,
      maxFileSize: AVATAR_MAX_FILE_SIZE,
    });

    form.parse(req, (error, _fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      const avatarInput = files.avatar;
      const avatarFile = Array.isArray(avatarInput) ? avatarInput[0] : avatarInput;
      if (!avatarFile) {
        reject(new Error("업로드할 파일이 없습니다."));
        return;
      }

      resolve(avatarFile);
    });
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AvatarUploadResponse>
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  const {
    context,
    error: authError,
    status: authStatus,
  } = await getAuthContextByAccessToken(accessToken);
  if (authError || !context) {
    return res.status(authStatus).json({ error: "로그인 상태를 확인해주세요." });
  }

  if (!AVATAR_BUCKET) {
    return res.status(500).json({ error: "SUPABASE_AVATAR_BUCKET 환경변수가 필요합니다." });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res.status(500).json({ error: "서버 Supabase 클라이언트를 초기화하지 못했습니다." });
  }

  let avatarFile: FormidableFile;
  try {
    avatarFile = await parseAvatarFile(req);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "httpCode" in error && // error 객체 안에 httpCode 속성이 있는지 확인
      typeof error.httpCode === "number" &&
      error.httpCode === 413 // 그 숫자가 정확히 413인지 확인 (Payload Too Large)
    ) {
      return res.status(413).json({ error: "프로필 이미지는 2MB 이하만 업로드할 수 있습니다." });
    }

    return res.status(400).json({ error: "이미지 파일 업로드 형식이 올바르지 않습니다." });
  }

  if (avatarFile.size > AVATAR_MAX_FILE_SIZE) {
    return res.status(413).json({ error: "프로필 이미지는 2MB 이하만 업로드할 수 있습니다." });
  }

  try {
    const normalizedMimeType = getNormalizedAvatarMimeType(avatarFile.mimetype ?? "");
    if (!normalizedMimeType) {
      return res
        .status(400)
        .json({ error: "프로필 이미지는 JPG/PNG 파일만 업로드할 수 있습니다. (SVG 불가)" });
    }

    const fileBuffer = await fs.readFile(avatarFile.filepath);
    // avatarFile.filepath : 서버 디스크에 임시 저장된 업로드 파일
    // 메모리로 읽어서 Buffer(바이너리 데이터)로 만드는 코드
    const detectedMimeType = detectAvatarMimeTypeFromBuffer(fileBuffer);
    if (!detectedMimeType || detectedMimeType !== normalizedMimeType) {
      return res
        .status(400)
        .json({ error: "파일 형식이 올바르지 않습니다. JPG/PNG만 업로드할 수 있습니다." });
    }

    const replacedAvatar = await replaceUserAvatar({
      supabaseServer,
      bucket: AVATAR_BUCKET,
      userId: context.userId,
      fileBuffer,
      contentType: detectedMimeType,
    });

    return res.status(200).json(replacedAvatar);
  } catch (error) {
    console.error("Avatar upload API failed", error);
    const message = error instanceof Error ? error.message : "아바타 업로드에 실패했습니다.";
    return res.status(500).json({ error: message });
  } finally {
    await fs.unlink(avatarFile.filepath).catch(() => undefined);
  }
}

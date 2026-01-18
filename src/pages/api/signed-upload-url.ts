import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { User } from "@/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? "avartarStorage";

function requireEnv(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeExtFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}
// 아바타 업로드용 서명 URL을 발급해주는 API
// 클라이언트가 파일을 직접 Supabase Storage에 업로드할 수 있게 서버에서 안전하게 서명 URL을 만들어 줌
// 즉, 업로드 권한을 서버가 발급하고, 클라이언트가 그 URL로 직접 업로드하게 만드는 API다.
// 서버가 “이 파일 경로에 업로드할 수 있다”는 권한을 서명된 토큰/URL로 발급해 주는 것이다.
// 클라이언트는 그 서명된 URL을 이용해서 제한된 조건(경로, 시간, 토큰)에 맞게 업로드할 수 있다.
// 그래서 “업로드 권한을 서버가 발급하고, 클라이언트가 그 URL로 직접 업로드”가 바로 이 개념이다.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    // createClient로 서비스 롤 키를 사용하는 서버용 Supabase 클라이언트를 생성
    const supabaseUrl = requireEnv(SUPABASE_URL, "SUPABASE_URL");
    const serviceKey = requireEnv(SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { mime, userId } = req.body as { mime?: string; userId?: User["id"] };

    // mime이 없거나 image/로 시작하지 않으면 400
    if (!mime || !mime.startsWith("image/")) {
      res.status(400).json({ error: "Invalid mime" });
      return;
    }

    // mime을 안전한 확장자로 변환(jpg/png/webp, 나머지는 bin)
    const ext = safeExtFromMime(mime);

    // crypto.randomUUID() : 랜덤 파일명 생성
    // crypto : Node.js 내장 암호화 모듈
    const filename = `${crypto.randomUUID()}.${ext}`;

    const path = userId ? `users/${userId}/${filename}` : `users/new/${filename}`;

    // createSignedUploadUrl(path) : 서명 업로드 URL 생성
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      res.status(500).json({ error: error?.message ?? "Failed to create signed upload url" });
      return;
    }

    console.log("data : ", data);
    const signedUpload = {
      bucket: BUCKET,
      uploadPath: data.path,
      // uploadPath : Storage 안에서의 파일 경로, 버킷 내부 위치를 가리키는 식별자
      // ex) uploadToSignedUrl(path, token, file)
      uploadToken: data.token,
      signedUploadUrl: data.signedUrl,
      // 그 경로에 업로드할 수 있도록 서명된 실제 URL
      // signedUploadUrl : Supabase SDK를 쓰지 않고 직접 HTTP 요청으로 업로드할 때 사용
      // ex) fetch(signedUploadUrl, { method: "PUT", body: file, headers: ... })
    };

    res.status(200).json(signedUpload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}

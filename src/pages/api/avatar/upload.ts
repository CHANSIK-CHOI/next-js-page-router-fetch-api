import { promises as fs } from "node:fs";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { type File as FormidableFile } from "formidable";
import { MAX_AVATAR_FILE_SIZE } from "@/constants";
import { getAccessToken } from "@/util";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import { getSupabaseServer } from "@/lib/supabase.server";
import { replaceUserAvatar } from "@/lib/avatar.server";
import type { AvatarUploadResponse } from "@/types";

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET;

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseAvatarFile = (req: NextApiRequest): Promise<FormidableFile> =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      allowEmptyFiles: false,
      maxFiles: 1,
      maxFileSize: MAX_AVATAR_FILE_SIZE,
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<AvatarUploadResponse>) {
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
      "httpCode" in error &&
      typeof error.httpCode === "number" &&
      error.httpCode === 413
    ) {
      return res.status(413).json({ error: "프로필 이미지는 2MB 이하만 업로드할 수 있습니다." });
    }

    return res.status(400).json({ error: "이미지 파일 업로드 형식이 올바르지 않습니다." });
  }

  const mimeType = avatarFile.mimetype ?? "";
  if (!mimeType.startsWith("image/")) {
    return res.status(400).json({ error: "이미지 파일만 업로드할 수 있습니다." });
  }

  if (avatarFile.size > MAX_AVATAR_FILE_SIZE) {
    return res.status(413).json({ error: "프로필 이미지는 2MB 이하만 업로드할 수 있습니다." });
  }

  try {
    const fileBuffer = await fs.readFile(avatarFile.filepath);
    const replacedAvatar = await replaceUserAvatar({
      supabaseServer,
      bucket: AVATAR_BUCKET,
      userId: context.userId,
      fileBuffer,
      contentType: mimeType,
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

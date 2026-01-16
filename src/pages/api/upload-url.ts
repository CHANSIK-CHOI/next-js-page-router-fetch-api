// pages/api/upload-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? "avartarStorage";

function requireEnv(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeExtFromMime(mime: string) {
  // 최소 매핑(필요시 확장)
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const supabaseUrl = requireEnv(SUPABASE_URL, "SUPABASE_URL");
    const serviceKey = requireEnv(SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { mime, userId } = req.body as { mime?: string; userId?: string };

    // ✅ 서버에서 검증(절대 클라 믿지 않기)
    if (!mime || !mime.startsWith("image/")) {
      res.status(400).json({ error: "Invalid mime" });
      return;
    }

    // ✅ path는 “DB/외부 API에 저장할 값” (너의 선택)
    const ext = safeExtFromMime(mime);
    const filename = `${crypto.randomUUID()}.${ext}`;

    // userId가 없으면 임시 폴더로라도 넣자 (너 상황에 맞게)
    const path = userId ? `users/${userId}/${filename}` : `users/new/${filename}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      res.status(500).json({ error: error?.message ?? "Failed to create signed upload url" });
      return;
    }

    // data: { signedUrl, token, path } 형태로 내려옴 :contentReference[oaicite:1]{index=1}
    res.status(200).json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}

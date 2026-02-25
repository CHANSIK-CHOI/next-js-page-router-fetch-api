import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET;
const USER_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

const buildAvatarPath = (userId: string) => `users/${userId}/avatar`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  if (!userId || !USER_ID_PATTERN.test(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  if (!AVATAR_BUCKET) {
    return res.status(500).json({ error: "SUPABASE_AVATAR_BUCKET 환경변수가 필요합니다." });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res.status(500).json({ error: "서버 Supabase 클라이언트를 초기화하지 못했습니다." });
  }

  const { data, error } = await supabaseServer.storage.from(AVATAR_BUCKET).download(buildAvatarPath(userId));
  if (error || !data) {
    return res.status(404).json({ error: "Avatar not found" });
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer());
  res.setHeader("Content-Type", data.type || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  return res.status(200).send(fileBuffer);
}

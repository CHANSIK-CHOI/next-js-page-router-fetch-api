import type { NextApiRequest, NextApiResponse } from "next";
import { PLACEHOLDER_SRC } from "@/constants";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import { getSupabaseServer } from "@/lib/supabase.server";
import { buildAvatarPath, getAccessToken } from "@/util";

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET;
const USER_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

const getAccessTokenFromRequest = (req: NextApiRequest) => {
  const tokenFromHeader = getAccessToken(req.headers.authorization);
  if (tokenFromHeader) return tokenFromHeader;
  return typeof req.cookies["sb-access-token"] === "string" ? req.cookies["sb-access-token"] : null;
};

const respondWithPlaceholder = (res: NextApiResponse) => {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Authorization, Cookie");
  return res.redirect(302, PLACEHOLDER_SRC);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  if (!userId || !USER_ID_PATTERN.test(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  const accessToken = getAccessTokenFromRequest(req);
  if (!accessToken) {
    return respondWithPlaceholder(res);
  }

  const { context, error: authError } = await getAuthContextByAccessToken(accessToken);
  if (authError || !context) {
    return respondWithPlaceholder(res);
  }

  if (context.userId !== userId && !context.isAdmin) {
    return respondWithPlaceholder(res);
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
    return respondWithPlaceholder(res);
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer());
  res.setHeader("Vary", "Authorization, Cookie");
  res.setHeader("Content-Type", data.type || "application/octet-stream");
  res.setHeader("Cache-Control", "private, max-age=60, s-maxage=0");
  return res.status(200).send(fileBuffer);
}

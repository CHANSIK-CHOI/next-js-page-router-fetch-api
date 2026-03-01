import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuthContext } from "@/lib/auth/request";

// GET: 현재 로그인 유저의 role만 반환
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ role: null, error: "Method Not Allowed" });
  }

  const auth = await getRequestAuthContext(req);
  if (auth.error || !auth.context) {
    return res.status(auth.status).json({ role: null, error: auth.error ?? "Unauthorized" });
  }

  if (!auth.context.role) {
    return res.status(404).json({ role: null, error: "Role not found" });
  }

  return res.status(200).json({ role: auth.context.role, error: null });
}

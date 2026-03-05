import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuthContext } from "@/lib/auth/request";
import type { ApiResponse } from "@/types/common";
import type { UserRole } from "@/types/user-role";

type UserRoleMeResponse = ApiResponse<{
  role: UserRole["role"];
}>;

// GET: 현재 로그인 유저의 role만 반환
export default async function handler(req: NextApiRequest, res: NextApiResponse<UserRoleMeResponse>) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const auth = await getRequestAuthContext(req);
  if (auth.error || !auth.context) {
    return res.status(auth.status).json({ data: null, error: auth.error ?? "Unauthorized" });
  }

  if (!auth.context.role) {
    return res.status(404).json({ data: null, error: "Role not found" });
  }

  return res.status(200).json({ data: { role: auth.context.role }, error: null });
}

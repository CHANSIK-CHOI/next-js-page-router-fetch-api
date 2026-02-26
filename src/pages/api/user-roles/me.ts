import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerByAccessToken } from "@/lib/supabase.server";
import type { SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

// GET: 현재 로그인 유저의 role만 반환
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ role: null, error: "Method Not Allowed" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ role: null, error: "Missing access token" });
  }

  const supabaseServer = getSupabaseServerByAccessToken(accessToken);
  if (!supabaseServer) {
    return res.status(500).json({ role: null, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser();
    if (authError || !authData.user) {
      return res.status(401).json({ role: null, error: authError?.message ?? "Unauthorized" });
    }

    const {
      data: existingRole,
      error: existingError,
    }: { data: UserRole | null; error: SupabaseError } = await supabaseServer
      .from("user_roles")
      .select("user_id, role")
      .eq("user_id", authData.user.id)
      .limit(1)
      .maybeSingle();
    if (existingError) {
      return res
        .status(500)
        .json({ role: null, error: existingError?.message ?? "Select failed Existing Role" });
    }

    if (!existingRole?.role) {
      return res.status(404).json({ role: null, error: "Role not found" });
    }

    return res.status(200).json({ role: existingRole.role, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ role: null, error: message });
  }
}

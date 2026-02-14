import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

// POST: role 없으면 reviewer로 생성(201), 있으면 기존 role 반환(200)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ role: null, error: "Method Not Allowed" });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res
      .status(500)
      .json({ role: null, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ role: null, error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ role: null, error: authError?.message ?? "Unauthorized" });
    }

    // 데이터가 이미 있으면 기존 role 반환
    const {
      data: existingRole,
      error: existingError,
    }: { data: Pick<UserRole, "user_id" | "role"> | null; error: SupabaseError } =
      await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
    if (existingError) {
      return res
        .status(500)
        .json({ role: null, error: existingError?.message ?? "Select failed Existing Role" });
    }

    if (existingRole?.role) {
      return res.status(200).json({ role: existingRole?.role, error: null });
    }

    // 데이터가 없으면 새로 role 추가
    const { data, error }: { data: UserRole[] | null; error: SupabaseError } = await supabaseServer
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "reviewer",
      })
      .select();
    if (error || !data || !data[0]) {
      return res.status(500).json({ role: null, error: error?.message ?? "Insert failed" });
    }

    return res.status(201).json({ role: data[0].role, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ role: null, error: message });
  }
}

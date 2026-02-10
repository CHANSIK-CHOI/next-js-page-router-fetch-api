import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import { SupabaseError, UserRole } from "@/types";

// GET: 현재 로그인 유저의 role만 반환
// POST: role 없으면 reviewer로 삽입 (이미 있으면 그대로)
// 인증은 Authorization Bearer 토큰으로만 처리
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const authHeader = req.headers.authorization;
  const accessToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message ?? "Unauthorized" });
    }

    if (req.method === "GET") {
      const { data, error }: { data: UserRole | null; error: SupabaseError } = await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return res.status(200).json({ role: data?.role ?? null });
    }

    if (req.method === "POST") {
      const {
        data: existingRole,
        error: existingError,
      }: { data: UserRole | null; error: SupabaseError } = await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);

      if (existingRole) {
        return res.status(200).json({ role: existingRole.role });
      }

      const { data, error }: { data: UserRole[] | null; error: SupabaseError } =
        await supabaseServer
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: "reviewer",
          })
          .select();
      if (error || !data || !data[0]) throw new Error(error?.message ?? "Insert failed");

      return res.status(200).json({ role: data[0].role });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

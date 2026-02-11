import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

// POST: role 없으면 reviewer로 삽입, 있으면 기존 role 반환
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const authHeader = req.headers.authorization;
  const accessToken = getAccessToken(authHeader);
  if (!accessToken) {
    return res.status(401).json({ role: null, error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ role: null, error: authError?.message ?? "Unauthorized" });
    }

    const {
      data: existingRole,
      error: existingError,
    }: { data: Pick<UserRole, "user_id" | "role"> | null; error: SupabaseError } =
      await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (existingRole) {
      return res.status(200).json({ role: existingRole.role, error: null });
    }

    const { data, error }: { data: UserRole[] | null; error: SupabaseError } = await supabaseServer
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "reviewer",
      })
      .select();
    if (error || !data || !data[0]) throw new Error(error?.message ?? "Insert failed");

    return res.status(200).json({ role: data[0].role, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ role: null, error: message });
  }
}

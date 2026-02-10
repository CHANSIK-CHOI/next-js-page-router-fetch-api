import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { SupabaseError, UserRole } from "@/types";
import { getPendingFeedbacksCountApi } from "@/lib/users.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res
      .status(500)
      .json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const authHeader = req.headers.authorization;
  const accessToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
  if (!accessToken) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message ?? "Unauthorized" });
    }

    const { data: roleData, error: roleError }: { data: UserRole | null; error: SupabaseError } =
      await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
    if (roleError) throw new Error(roleError.message);

    if (!roleData || roleData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const count = await getPendingFeedbacksCountApi();
    return res.status(200).json({ count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

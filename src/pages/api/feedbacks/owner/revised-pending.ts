import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { RevisedPendingOwnerFeedback, SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res
      .status(500)
      .json({ data: null, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ data: null, error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ data: null, error: authError?.message ?? "Unauthorized" });
    }

    const {
      data: roleData,
      error: roleError,
    }: { data: Pick<UserRole, "user_id" | "role"> | null; error: SupabaseError } =
      await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
    if (roleError || !roleData?.role) {
      return res
        .status(500)
        .json({ data: null, error: roleError?.message ?? "Select failed Role Data" });
    }

    if (roleData.role === "admin") {
      return res.status(200).json({ data: null, error: null });
    }

    const { data, error: dataError } = await supabaseServer
      .from("feedbacks")
      .select()
      .eq("author_id", authData.user.id)
      .in("status", ["pending", "revised_pending"]);

    if (dataError || !data) {
      return res
        .status(500)
        .json({ data: null, error: dataError?.message ?? "Select failed Owner Pending Data" });
    }

    const ownerFeedbacks: RevisedPendingOwnerFeedback[] = data.map((item) => ({
      ...item,
      isPreview: false,
    }));

    return res.status(200).json({ data: ownerFeedbacks, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}

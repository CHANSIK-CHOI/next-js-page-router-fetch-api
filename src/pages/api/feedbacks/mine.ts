import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerByAccessToken } from "@/lib/supabase.server";
import type { RevisedPendingOwnerFeedback, SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

const ALLOWED_STATUSES = ["pending", "revised_pending"] as const;
type MineStatus = (typeof ALLOWED_STATUSES)[number];

const parseStatusQuery = (
  rawStatus: string | string[] | undefined
): { statuses: MineStatus[] | null; error: string | null } => {
  if (typeof rawStatus === "undefined") {
    return { statuses: [...ALLOWED_STATUSES], error: null };
  }

  const parsed = (Array.isArray(rawStatus) ? rawStatus : [rawStatus])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    return {
      statuses: null,
      error: "Invalid status query. Use ?status=pending,revised_pending",
    };
  }

  const invalidStatuses = parsed.filter(
    (status): status is string => !ALLOWED_STATUSES.includes(status as MineStatus)
  );
  if (invalidStatuses.length > 0) {
    return {
      statuses: null,
      error: `Unsupported status: ${invalidStatuses.join(", ")}`,
    };
  }

  return {
    statuses: Array.from(new Set(parsed)) as MineStatus[],
    error: null,
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ data: null, error: "Missing access token" });
  }

  const { statuses, error: statusError } = parseStatusQuery(req.query.status);
  if (statusError || !statuses) {
    return res.status(400).json({ data: null, error: statusError ?? "Invalid status query" });
  }

  const supabaseServer = getSupabaseServerByAccessToken(accessToken);
  if (!supabaseServer) {
    return res
      .status(500)
      .json({ data: null, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser();
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
      .in("status", statuses);

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

import type { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "@/util";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import type { AdminReviewFeedbackWithEmail, FeedbackPrivateRow, SupabaseError } from "@/types";

const ALLOWED_STATUSES = ["pending", "approved", "rejected", "revised_pending"] as const;
type FeedbackStatus = (typeof ALLOWED_STATUSES)[number];

const parseStatusQuery = (
  rawStatus: string | string[] | undefined
): { statuses: FeedbackStatus[] | null; error: string | null } => {
  if (typeof rawStatus === "undefined") {
    return { statuses: ["pending", "revised_pending", "rejected"], error: null };
  }

  const parsed = (Array.isArray(rawStatus) ? rawStatus : [rawStatus])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    return {
      statuses: null,
      error: "Invalid status query. Use ?status=pending,revised_pending,rejected",
    };
  }

  const invalidStatuses = parsed.filter(
    (status): status is string => !ALLOWED_STATUSES.includes(status as FeedbackStatus)
  );

  if (invalidStatuses.length > 0) {
    return {
      statuses: null,
      error: `Unsupported status: ${invalidStatuses.join(", ")}`,
    };
  }

  return {
    statuses: Array.from(new Set(parsed)) as FeedbackStatus[],
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
  console.log("statuses -----------> ", statuses);
  console.log("statusError -----------> ", statusError);
  if (statusError || !statuses) {
    return res.status(400).json({ data: null, error: statusError ?? "Invalid status query" });
  }

  try {
    const {
      context,
      error: authError,
      status: authStatus,
    } = await getAuthContextByAccessToken(accessToken);
    if (authError || !context) {
      return res.status(authStatus).json({ data: null, error: authError ?? "Unauthorized" });
    }

    if (!context.isAdmin) {
      return res.status(403).json({ data: null, error: "Forbidden" });
    }

    const { data, error }: { data: FeedbackPrivateRow[] | null; error: SupabaseError } =
      await context.supabaseServer
        .from("feedbacks")
        .select("*")
        .in("status", statuses)
        .order("updated_at", { ascending: false });

    if (error || !data) {
      return res.status(500).json({ data: null, error: error?.message ?? "Select failed" });
    }

    const adminFeedbacks: AdminReviewFeedbackWithEmail[] = data.map((item) => ({
      ...item,
      isPreview: false,
    }));

    return res.status(200).json({ data: adminFeedbacks, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuthContext } from "@/lib/auth/request";
import { parseStatusQuery } from "@/lib/status/query";
import type { AdminReviewFeedbackWithEmail, FeedbackPrivateRow, SupabaseError } from "@/types";

const ALLOWED_STATUSES = ["pending", "approved", "rejected", "revised_pending"] as const;
type FeedbackStatus = (typeof ALLOWED_STATUSES)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const { statuses, error: statusError } = parseStatusQuery<FeedbackStatus>({
    rawStatus: req.query.status,
    allowedStatuses: ALLOWED_STATUSES,
    defaultStatuses: ["pending", "revised_pending", "rejected"],
    usageMessage: "Use ?status=pending,revised_pending,rejected",
  });
  if (statusError || !statuses) {
    return res.status(400).json({ data: null, error: statusError ?? "Invalid status query" });
  }

  try {
    const auth = await getRequestAuthContext(req, { requireAdmin: true });
    if (auth.error || !auth.context) {
      return res.status(auth.status).json({ data: null, error: auth.error ?? "Unauthorized" });
    }
    const { context } = auth;

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

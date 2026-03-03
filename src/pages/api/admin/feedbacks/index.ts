import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuthContext } from "@/lib/auth/request";
import { getFeedbackRowsByStatuses } from "@/lib/feedback/server";
import { parseStatusQuery } from "@/lib/status/query";
import type { AdminReviewFeedbackWithEmail } from "@/types";

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

    const feedbackRows = await getFeedbackRowsByStatuses({
      supabaseClient: context.supabaseServer,
      statuses,
    });

    const adminFeedbacks: AdminReviewFeedbackWithEmail[] = feedbackRows.map((item) => ({
      ...item,
      isPreview: false,
    }));

    return res.status(200).json({ data: adminFeedbacks, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}

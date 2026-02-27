import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import { parseStatusQuery } from "@/lib/statusQuery";
import type { RevisedPendingOwnerFeedback } from "@/types";
import { getAccessToken } from "@/util";

const ALLOWED_STATUSES = ["pending", "revised_pending"] as const;
type MineStatus = (typeof ALLOWED_STATUSES)[number];

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

  const { statuses, error: statusError } = parseStatusQuery<MineStatus>({
    rawStatus: req.query.status,
    allowedStatuses: ALLOWED_STATUSES,
    defaultStatuses: ALLOWED_STATUSES,
    usageMessage: "Use ?status=pending,revised_pending",
  });
  if (statusError || !statuses) {
    return res.status(400).json({ data: null, error: statusError ?? "Invalid status query" });
  }

  try {
    const { context, error: authError, status: authStatus } =
      await getAuthContextByAccessToken(accessToken);
    if (authError || !context) {
      return res.status(authStatus).json({ data: null, error: authError ?? "Unauthorized" });
    }

    if (context.isAdmin) {
      return res.status(200).json({ data: null, error: null });
    }

    const { data, error: dataError } = await context.supabaseServer
      .from("feedbacks")
      .select()
      .eq("author_id", context.userId)
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

import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getAuthContextByAccessToken } from "@/lib/auth.server";
import { APPROVED_PUBLIC_COLUMNS } from "@/constants";
import type {
  AdminReviewFeedback,
  ApprovedFeedback,
  FeedbackPrivateRow,
  SupabaseError,
} from "@/types";
import { getAccessToken } from "@/util";

/*
  전체 역할 : 해당 API는 GET /api/feedbacks?status=...로 피드백 목록을 가져옴
  핵심 규칙:
  - approved만 조회하면 공개 조회 허용
  - approved 외 상태(pending, revised_pending, rejected)가 하나라도 포함되면 admin만 허용
*/
const ALLOWED_STATUSES = ["pending", "approved", "rejected", "revised_pending"] as const;
type FeedbackStatus = (typeof ALLOWED_STATUSES)[number];

// 상태 파싱/검증 (parseStatusQuery)
const parseStatusQuery = (
  rawStatus: string | string[] | undefined
): { statuses: FeedbackStatus[] | null; error: string | null } => {
  if (typeof rawStatus === "undefined") {
    // 없으면 기본값 ["approved"]
    return { statuses: ["approved"], error: null };
  }

  // parsed : "pending,revised_pending" 같은 CSV를 배열로 파싱
  const parsed = (Array.isArray(rawStatus) ? rawStatus : [rawStatus])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    return {
      statuses: null,
      error: "Invalid status query. Use ?status=approved or ?status=pending,revised_pending",
    };
  }

  // 허용 상태(ALLOWED_STATUSES)인지 검증
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
    statuses: Array.from(new Set(parsed)) as FeedbackStatus[], // 중복 제거(new Set)
    error: null,
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const { statuses, error: statusError } = parseStatusQuery(req.query.status);
  if (statusError || !statuses) {
    // status 쿼리가 이상하면 바로 400으로 막음
    return res.status(400).json({ data: null, error: statusError ?? "Invalid status query" });
  }

  try {
    // approved 아닌 상태가 하나라도 있으면 true - admin만 허용
    const isRequiresAdmin = statuses.some((status) => status !== "approved");

    // 공개 조회 분기 (!isRequiresAdmin)
    if (!isRequiresAdmin) {
      const supabaseServer = getSupabaseServer();
      if (!supabaseServer) {
        return res
          .status(500)
          .json({ data: null, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
      }

      type ApprovedPublicRow = Omit<ApprovedFeedback, "isPreview">;
      const { data, error }: { data: ApprovedPublicRow[] | null; error: SupabaseError } =
        await supabaseServer
          .from("feedbacks")
          .select(APPROVED_PUBLIC_COLUMNS)
          .in("status", statuses)
          .eq("is_public", true)
          .order("updated_at", { ascending: false });

      if (error || !data) {
        return res.status(500).json({ data: null, error: error?.message ?? "Select failed" });
      }

      const publicFeedbacks: ApprovedFeedback[] = data.map((item) => ({
        ...item,
        isPreview: false,
      }));

      return res.status(200).json({ data: publicFeedbacks, error: null });
    }

    // 관리자 전용 조회 분기 (isRequiresAdmin)
    const accessToken = getAccessToken(req.headers.authorization);
    if (!accessToken) {
      return res.status(401).json({ data: null, error: "Missing access token" });
    }

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

    const adminReviewFeedbacks: AdminReviewFeedback[] = data.map((item) => {
      const { email, ...withoutEmail } = item;
      void email;
      return {
        ...withoutEmail,
        isPreview: false,
      };
    });

    return res.status(200).json({ data: adminReviewFeedbacks, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}

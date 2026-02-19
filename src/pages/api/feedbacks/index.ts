import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer, getSupabaseServerByAccessToken } from "@/lib/supabase.server";
import type { AdminReviewFeedback, FeedbackRow, SupabaseError, UserRole } from "@/types";
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

// 관리자 판별 (isAdminRole)
const isAdminRole = async (
  accessToken: string
): Promise<{ isAdmin: boolean; error: string | null }> => {
  // getSupabaseServerByAccessToken(accessToken)로 사용자 컨텍스트 클라이언트 생성
  const supabaseServer = getSupabaseServerByAccessToken(accessToken);
  if (!supabaseServer) {
    return { isAdmin: false, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" };
  }

  // auth.getUser()로 토큰 유효성 + 사용자 식별
  const { data: authData, error: authError } = await supabaseServer.auth.getUser();
  if (authError || !authData.user) {
    return { isAdmin: false, error: authError?.message ?? "Unauthorized" };
  }

  // user_roles에서 role 조회 (roleData)
  const {
    data: roleData,
    error: roleError,
  }: { data: Pick<UserRole, "role"> | null; error: SupabaseError } = await supabaseServer
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (roleError) {
    return { isAdmin: false, error: roleError.message };
  }

  // roleData?.role === "admin"이면 admin
  return { isAdmin: roleData?.role === "admin", error: null };
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

      const { data, error }: { data: FeedbackRow[] | null; error: SupabaseError } =
        await supabaseServer
          .from("feedbacks")
          .select("*")
          .in("status", statuses)
          .eq("is_public", true)
          .order("updated_at", { ascending: false });

      if (error || !data) {
        return res.status(500).json({ data: null, error: error?.message ?? "Select failed" });
      }

      return res.status(200).json({ data, error: null });
    }

    // 관리자 전용 조회 분기 (isRequiresAdmin)
    const accessToken = getAccessToken(req.headers.authorization);
    if (!accessToken) {
      return res.status(401).json({ data: null, error: "Missing access token" });
    }

    const { isAdmin, error: adminError } = await isAdminRole(accessToken);
    if (adminError) {
      return res.status(401).json({ data: null, error: adminError });
    }
    if (!isAdmin) {
      return res.status(403).json({ data: null, error: "Forbidden" });
    }

    const supabaseServer = getSupabaseServerByAccessToken(accessToken);
    if (!supabaseServer) {
      return res
        .status(500)
        .json({ data: null, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" });
    }

    const { data, error }: { data: FeedbackRow[] | null; error: SupabaseError } =
      await supabaseServer
        .from("feedbacks")
        .select("*")
        .in("status", statuses)
        .order("updated_at", { ascending: false });

    if (error || !data) {
      return res.status(500).json({ data: null, error: error?.message ?? "Select failed" });
    }

    const adminReviewFeedbacks: AdminReviewFeedback[] = data.map((item) => {
      return {
        ...item,
        isPreview: false,
      };
    });

    return res.status(200).json({ data: adminReviewFeedbacks, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ data: null, error: message });
  }
}

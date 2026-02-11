import type { ErrorAlertMsg, FeedbackData, User, UserRole } from "@/types";
import { getSupabaseServer } from "@/lib/supabase.server";

export function getUserApi(): Promise<{ data: User[] }>;
export function getUserApi(id: User["id"]): Promise<{ data: User | null }>;
export async function getUserApi(id?: User["id"]) {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (id) {
    const { data, error: userDataError } = await supabaseServer
      .from("users")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (userDataError) {
      const error: ErrorAlertMsg = new Error(userDataError.message);
      error.alertMsg = "유저 데이터를 받아올 수 없습니다.";
      throw error;
    }
    return { data };
  }

  const { data, error: usersDataError } = await supabaseServer
    .from("users")
    .select()
    .order("created_at", {
      ascending: false,
    });
  if (usersDataError || !data) {
    const error: ErrorAlertMsg = new Error(usersDataError.message);
    error.alertMsg = "전체 유저 데이터를 받아올 수 없습니다.";
    throw error;
  }

  return { data };
}

export const getApprovedFeedbacksApi = async (): Promise<FeedbackData[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // status = 'approved' + is_public = true 데이터만 조회
  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select()
    .eq("status", "approved")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getApprovedFeedbacksApi");
  }

  return data;
};

export const getPendingFeedbacksCountApi = async (): Promise<number> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // status = 'pending' | 'revised_pending' 개수만 조회
  const { count, error: feedbackError } = await supabaseServer
    .from("feedbacks")
    .select("id", { count: "exact", head: true })
    // 데이터는 가져오지 않고 “개수만” 세기 위한 Supabase 쿼리 옵션
    // select("id"): 카운트 기준 컬럼 지정 (여기선 id)
    // count: "exact": 정확한 개수를 계산
    // head: true: 실제 row 데이터는 내려받지 않음 (헤더만)

    .in("status", ["pending", "revised_pending"]);

  if (feedbackError || count === null) {
    throw new Error("getPendingFeedbacksCountApi Error!");
  }

  return count;
};

export const getUserRoles = async (): Promise<UserRole[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error: userRolesError } = await supabaseServer.from("user_roles").select();

  if (userRolesError || !data) {
    throw new Error("getUserRoles Error!");
  }

  return data;
};

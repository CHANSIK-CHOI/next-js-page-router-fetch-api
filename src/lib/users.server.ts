import type {
  ApprovedFeedback,
  ErrorAlertMsg,
  FeedbackData,
  RevisedPendingPreviewFeedback,
  User,
  UserRole,
} from "@/types";
import { getSupabaseServer } from "@/lib/supabase.server";
import { APPROVED_PUBLIC_COLUMNS, PREVIEWCOLUMN } from "@/constants";

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

export const getApprovedFeedbacksApi = async (): Promise<ApprovedFeedback[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(APPROVED_PUBLIC_COLUMNS)
    .eq("status", "approved")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getApprovedFeedbacksApi");
  }

  return data.map((item) => {
    return {
      ...item,
      // 공개 보드 응답에는 이메일을 포함하지 않는다.
      email: "",
      isPreview: false,
    };
  });
};

export const getRevisedPendingPreviewApi = async (): Promise<RevisedPendingPreviewFeedback[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select(PREVIEWCOLUMN)
    .eq("status", "revised_pending")
    .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getRevisedPendingPreviewApi");
  }

  return data.map((item) => {
    return {
      ...item,
      // 공개 보드 preview 응답에는 이메일을 포함하지 않는다.
      email: "",
      isPreview: true,
    };
  });
};
// getRevisedPendingPublicFeedbacksApi

export const getPendingFeedbacksApi = async (): Promise<FeedbackData[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // status = 'approved' + is_public = true 데이터만 조회
  const { data, error } = await supabaseServer
    .from("feedbacks")
    .select()
    .in("status", ["pending", "revised_pending"])
    // .eq("is_public", true)
    .order("created_at", {
      ascending: false,
    });

  if (error || !data) {
    throw new Error("Failed fetch getPendingFeedbacksApi");
  }

  return data;
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

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

export const getFeedbacksApi = async (): Promise<FeedbackData[]> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const { data, error: feedbackError } = await supabaseServer
    .from("feedbacks")
    .select()
    .order("created_at", {
      ascending: false,
    });

  if (feedbackError || !data) {
    throw new Error("getUserRoles Error!");
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

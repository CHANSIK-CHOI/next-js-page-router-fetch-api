import type { ErrorAlertMsg, User } from "@/types";
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

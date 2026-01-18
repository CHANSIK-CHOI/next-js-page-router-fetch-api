import type { PayloadNewUser, User } from "@/types";
import { getSupabaseServer } from "@/lib/supabase.server";

export const getUserApi = async <T extends User | User[]>(
  id?: User["id"]
): Promise<{ data: T }> => {
  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (id) {
    const { data, error } = await supabaseServer.from("users").select().eq("id", id).maybeSingle();
    if (error) {
      throw new Error("유저 데이터를 받아올 수 없습니다.");
    }
    return { data: data as T };
  }

  const { data, error } = await supabaseServer.from("users").select().order("created_at", {
    ascending: false,
  });
  if (error || !data) {
    throw new Error("전체 유저 데이터를 받아올 수 없습니다.");
  }

  return { data: data as T };
};

export const postUserApi = async (payload: PayloadNewUser) => {
  await fetch("/api/post-new-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

/*
export const getUserApi = async <T extends User | User[]>(
  id?: User["id"]
): Promise<{ data: T }> => {
  const url = id ? `${BASE_URL}/users?id=${id}` : `${BASE_URL}/users?page=1&per_page=12`;

  const response = await fetch(url, {
    headers: authHeaders,
  });

  await assertOk(response, "유저 데이터를 받아올 수 없습니다.");
  const result = await response.json();
  return result as { data: T };
};
*/

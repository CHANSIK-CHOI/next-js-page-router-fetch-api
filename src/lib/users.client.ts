import type { ApiResponseDeleteUser, ApiResponseNewUser, PayloadNewUser, User } from "@/types";
import readErrorBody from "@/lib/readErrorBody";
import { getSupabaseClient } from "@/lib/supabase.client";

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const postUserApi = async (payload: PayloadNewUser): Promise<ApiResponseNewUser> => {
  const response = await fetch("/api/post-new-user", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { error, alertMsg, rawText } = await readErrorBody(response);
    if (error) console.error(error);
    const err = new Error(error ?? alertMsg ?? rawText ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }

  const result: ApiResponseNewUser = await response.json();
  return result;
};

export const deleteUserApi = async (ids: User["id"][]): Promise<ApiResponseDeleteUser> => {
  const response = await fetch("/api/delete-user", {
    method: "DELETE",
    headers: await getAuthHeaders(),
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    const { error, alertMsg, rawText } = await readErrorBody(response);
    if (error) console.error(error);
    const err = new Error(error ?? alertMsg ?? rawText ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }

  const result: ApiResponseDeleteUser = await response.json();
  return result;
};

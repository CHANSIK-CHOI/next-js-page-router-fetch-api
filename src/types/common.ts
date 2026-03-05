import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseError = PostgrestError | null;

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

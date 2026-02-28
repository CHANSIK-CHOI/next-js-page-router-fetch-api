import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseError = PostgrestError | null;

export type ApiErrorResponse = {
  error: string;
};

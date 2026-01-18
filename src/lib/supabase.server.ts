import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseServer: SupabaseClient | null = null;

// Supabase에서 “프로젝트에 접속할 수 있는 클라이언트 객체
// createClient는 Supabase API에 연결하기 위한 접속 핸들(클라이언트 인스턴스) 를 만드는 역할
export function getSupabaseServer() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return supabaseServer;
}

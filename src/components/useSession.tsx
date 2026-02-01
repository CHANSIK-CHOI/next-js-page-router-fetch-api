import { useContext, createContext } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type SessionContextValue = {
  session: Session | null;
  supabaseClient: SupabaseClient | null;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("SessionProvider 안에서만 사용하세요");
  }
  return ctx;
}

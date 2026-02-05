import React, { ReactNode, useEffect, useState } from "react";
import { SessionContext } from "./useSession";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase.client";

type SessionProviderProps = {
  children: ReactNode;
};
export default function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionInit, setIsSessionInit] = useState(true);
  const supabaseClient: SupabaseClient | null = getSupabaseClient();

  useEffect(() => {
    if (!supabaseClient) {
      console.error("Supabase를 확인해주세요.");
      setIsSessionInit(false);
      return;
    }
    let isMounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsSessionInit(false);
    });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsSessionInit(false);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <SessionContext.Provider value={{ session, supabaseClient, isSessionInit }}>
      {children}
    </SessionContext.Provider>
  );
}

import React, { ReactNode, useEffect, useState } from "react";
import { SessionContext } from "./useSession";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase.client";

type SessionProviderProps = {
  children: ReactNode;
};
export default function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const supabaseClient: SupabaseClient | null = getSupabaseClient();

  useEffect(() => {
    if (!supabaseClient) return;
    let isMounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session ?? null);
    });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      console.log({ nextSession });
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <SessionContext.Provider value={{ session, supabaseClient }}>
      {children}
    </SessionContext.Provider>
  );
}

import React, { ReactNode, useEffect, useRef, useState } from "react";
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
  const roleSyncUserRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!session?.user?.id || !session.access_token) {
      roleSyncUserRef.current = null;
      return;
    }
    if (roleSyncUserRef.current === session.user.id) return;

    // 로그인 수단과 관계없이 세션 생성 시 user_roles를 동기화한다.
    const syncUserRole = async () => {
      const response = await fetch("/api/user-roles/ensure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload: { role?: "admin" | "reviewer" | null; error?: string } =
        await response.json().catch(() => ({}));
      if (!response.ok || payload.error) {
        const message = payload.error ?? "Failed to sync user role";
        throw new Error(message);
      }

      roleSyncUserRef.current = session.user.id;
    };

    syncUserRole().catch((error) => {
      console.error("Failed to sync user role", error);
    });
  }, [session?.user?.id, session?.access_token]);

  return (
    <SessionContext.Provider value={{ session, supabaseClient, isSessionInit }}>
      {children}
    </SessionContext.Provider>
  );
}

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { SessionContext } from "./useSession";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase.client";
import { UserRole } from "@/types";

type SessionProviderProps = {
  children: ReactNode;
};

const CACHE_KEY = (id: string) => `role:${id}`;
const CACHE_TTL = 5 * 60 * 1000; // 5분

export default function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitSessionComplete, setIsInitSessionComplete] = useState(false);
  const supabaseClient: SupabaseClient | null = getSupabaseClient();
  const [role, setRole] = useState<UserRole["role"] | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseClient) {
      setIsInitSessionComplete(false);
      return;
    }
    let isMounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsInitSessionComplete(true);
    });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsInitSessionComplete(true);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    // 회원가입 후 첫 login은 skip
    const isSignUpComplete = sessionStorage.getItem("signUpCompleteAndSkipRoleSync") === "1";
    if (isSignUpComplete) {
      sessionStorage.removeItem("signUpCompleteAndSkipRoleSync");
      setRole(null);
      setIsRoleLoading(false);
      return;
    }

    if (!session?.user?.id || !session.access_token) {
      setRole(null);
      setIsRoleLoading(false);
      return;
    }

    const cacheKey = CACHE_KEY(session.user.id);
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { role, ts } = JSON.parse(cached) as { role?: UserRole["role"] | null; ts?: number };
        setRole(role ?? null);
        setIsRoleLoading(false);

        const isFresh = typeof ts === "number" && Date.now() - ts < CACHE_TTL;
        if (isFresh) return;
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }

    // 로그인 수단과 관계없이 세션 생성 시 user_roles를 동기화한다.
    const syncUserRole = async () => {
      setIsRoleLoading(true);
      const response = await fetch("/api/user-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload: { role: "admin" | "reviewer" | null; error: string | null } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || payload.error || !payload.role) {
        const message = payload.error ?? "Failed Post user roles";
        throw new Error(message);
      }

      setRole(payload.role);
      sessionStorage.setItem(cacheKey, JSON.stringify({ role: payload.role, ts: Date.now() }));
    };

    syncUserRole()
      .catch((error) => {
        console.error(error);
        setRole(null);
      })
      .finally(() => {
        setIsRoleLoading(false);
      });
  }, [session?.user?.id, session?.access_token]);

  useEffect(() => {
    const syncSessionCookie = async () => {
      if (!session?.access_token) {
        syncedTokenRef.current = null;
        await fetch("/api/auth/session", {
          method: "DELETE",
        });
        return;
      }

      if (syncedTokenRef.current === session.access_token) return;

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload: { error?: string | null } = await response.json().catch(() => ({}));
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Failed to sync session cookie");
      }

      syncedTokenRef.current = session.access_token;
    };

    syncSessionCookie().catch((error) => {
      console.error(error);
    });
  }, [session?.access_token]);

  return (
    <SessionContext.Provider
      value={{ session, supabaseClient, isInitSessionComplete, role, isRoleLoading }}
    >
      {children}
    </SessionContext.Provider>
  );
}

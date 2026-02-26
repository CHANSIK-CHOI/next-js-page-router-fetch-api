import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { Session } from "@supabase/supabase-js";
import { useSession } from "@/components/useSession";
import { replaceSafely } from "@/lib/router.client";
import type { UserRoleSyncResponse } from "@/types";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { supabaseClient } = useSession();
  const isHandledRef = useRef(false);

  useEffect(() => {
    if (!supabaseClient) return;

    let isUnmounted = false;

    const handleSession = async (session: Session | null) => {
      if (isUnmounted || isHandledRef.current || !session?.user) return;
      isHandledRef.current = true;

      if (!session.access_token) {
        await replaceSafely(router, "/login");
        return;
      }

      const response = await fetch("/api/user-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await response.json().catch(() => null)) as UserRoleSyncResponse | null;

      if (!response.ok || !payload || payload.error || !payload.role) {
        await replaceSafely(router, "/login");
        return;
      }

      const isNewUser = response.status === 201;
      if (isNewUser) {
        sessionStorage.setItem("signUpCompleteAndSkipRoleSync", "1");
      }
      await replaceSafely(router, isNewUser ? "/my" : "/");
    };

    void supabaseClient.auth
      .getSession()
      .then(({ data }) => handleSession(data.session))
      .catch(() => undefined);

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        void handleSession(session);
      }
    });

    const fallbackTimer = window.setTimeout(() => {
      if (isUnmounted || isHandledRef.current) return;
      isHandledRef.current = true;
      void replaceSafely(router, "/login");
    }, 5000);

    return () => {
      isUnmounted = true;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [router, supabaseClient]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <section className="rounded-2xl border border-border/60 bg-white/80 p-7 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        GitHub 로그인 정보를 확인하고 있습니다.
      </section>
    </div>
  );
}

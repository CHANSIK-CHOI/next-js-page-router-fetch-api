import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import type { Session } from "@supabase/supabase-js";
import { useSession } from "@/components/useSession";
import { replaceSafely } from "@/lib/router.client";

const FIRST_LOGIN_THRESHOLD_MS = 30 * 1000;

const parseTime = (value: string | null | undefined) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const isFirstSignInUser = (
  createdAt: string | null | undefined,
  lastSignInAt: string | null | undefined
) => {
  const createdTime = parseTime(createdAt);
  const lastSignInTime = parseTime(lastSignInAt);

  if (createdTime === null || lastSignInTime === null) return false;
  return Math.abs(lastSignInTime - createdTime) <= FIRST_LOGIN_THRESHOLD_MS;
};

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

      const firstSignInUser = isFirstSignInUser(
        session.user.created_at,
        session.user.last_sign_in_at
      );
      await replaceSafely(router, firstSignInUser ? "/my" : "/");
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

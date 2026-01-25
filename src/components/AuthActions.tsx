import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./global-layout.module.scss";
import { getSupabaseClient } from "@/lib/supabase.client";
import type { Session } from "@supabase/supabase-js";
import Image from "next/image";

const cx = classNames.bind(styles);

export default function AuthActions() {
  const [session, setSession] = useState<Session | null>(null);
  const supabaseClient = getSupabaseClient();

  const handleLogin = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    console.log("Login", { data, error });
  };
  const handleLogout = async () => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    console.log("Logout", { error });
  };

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

  const user = session?.user;
  const rawName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.email?.split("@")[0];
  const userName = rawName ? String(rawName) : "사용자";
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.avatar;

  return (
    <div className={cx("authActions")}>
      {!session ? (
        <button type="button" className={cx("authButton")} onClick={handleLogin}>
          로그인
        </button>
      ) : (
        <>
          <div className={cx("profile")}>
            <span className={cx("avatar")}>
              {avatarUrl ? (
                <Image
                  className={cx("avatarImage")}
                  src={avatarUrl}
                  alt={`${userName} avatar`}
                  width={50}
                  height={50}
                  unoptimized={!avatarUrl}
                />
              ) : (
                <span className={cx("avatarFallback")}>{userName.slice(0, 1)}</span>
              )}
            </span>
            <span className={cx("userName")}>{userName} 님</span>
          </div>
          <button
            type="button"
            className={cx("authButton", "authButtonSecondary")}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </>
      )}
    </div>
  );
}

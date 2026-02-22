import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "@/components/ui";
import { useSession } from "./useSession";
import { pushSafely, replaceSafely } from "@/lib/router.client";

export default function AuthActions() {
  const { session, supabaseClient } = useSession();
  const router = useRouter();
  const [isMovingLogin, setIsMovingLogin] = useState(false);

  const handleLogout = async () => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.auth.signOut({ scope: "global" });
      if (error?.name === "AuthSessionMissingError") {
        await supabaseClient.auth.signOut({ scope: "local" });
      }
    } finally {
      // 로그아웃 직후 서버 쿠키를 즉시 정리해서 SSR 권한 체크를 바로 반영한다.
      await fetch("/api/auth/session", { method: "DELETE" });
      await replaceSafely(router, "/");
    }
  };
  const handleMoveLogin = async () => {
    if (isMovingLogin) return;
    setIsMovingLogin(true);
    try {
      await pushSafely(router, "/login");
    } finally {
      setIsMovingLogin(false);
    }
  };

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
    <div className="flex items-center gap-3">
      {!session?.access_token ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleMoveLogin}
          disabled={isMovingLogin}
        >
          로그인
        </Button>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted text-xs font-semibold text-primary">
              {avatarUrl ? (
                <Image
                  className="h-full w-full object-cover"
                  src={avatarUrl}
                  alt={`${userName} avatar`}
                  width={50}
                  height={50}
                  unoptimized={!avatarUrl}
                />
              ) : (
                <span className="uppercase">{userName.slice(0, 1)}</span>
              )}
            </span>
            <span className="text-sm font-medium text-foreground">{userName} 님</span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleLogout}>
            로그아웃
          </Button>
        </>
      )}
    </div>
  );
}

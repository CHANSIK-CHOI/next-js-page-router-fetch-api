import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui";
import { useSession } from "./useSession";
import { pushSafely, replaceSafely } from "@/lib/navigation/client";
import { getAvatarUrl } from "@/lib/avatar/profile";
import { checkAvatarApiSrcPrivate } from "@/lib/avatar/path";
import { getUserName } from "@/lib/user/profile";

export default function AuthActions() {
  const { session, supabaseClient } = useSession();
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);

  const handleLogout = async () => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.auth.signOut({ scope: "global" });
      // signOut({ scope: "global" }) : 서버 쪽(리프레시 토큰 포함)까지 로그아웃하려는 시도입니다.
      if (error?.name === "AuthSessionMissingError") {
        // 현재 탭에 세션이 이미 없으면 AuthSessionMissingError가 날 수 있음 예: 다른 탭에서 이미 로그아웃, 토큰 만료, 로컬 세션 손실
        // signOut({ scope: "local" })를 한 번 더 호출해서 클라이언트 로컬 auth 상태라도 확실히 정리
        await supabaseClient.auth.signOut({ scope: "local" });
      }
    } finally {
      // 로그아웃 직후 서버 쿠키를 즉시 정리해서 SSR 권한 체크를 바로 반영한다.
      await fetch("/api/auth/session", { method: "DELETE" });
      await replaceSafely(router, "/");
    }
  };
  const handleClickLogin = async () => {
    if (isLogging) return;
    setIsLogging(true);
    try {
      await pushSafely(router, "/login");
    } finally {
      setIsLogging(false);
    }
  };

  const user = session?.user;
  const userName = getUserName(user);
  const avatarSrc = getAvatarUrl(user);
  return (
    <div className="flex items-center gap-3">
      {!session?.access_token ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleClickLogin}
          disabled={isLogging}
        >
          로그인
        </Button>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted text-xs font-semibold text-primary">
              <Image
                className="h-full w-full object-cover"
                src={avatarSrc}
                alt={`${userName} avatar`}
                width={50}
                height={50}
                unoptimized={
                  avatarSrc.startsWith("data:") ||
                  avatarSrc.startsWith("blob:") ||
                  checkAvatarApiSrcPrivate(avatarSrc)
                }
              />
            </span>
            <span className="text-sm font-medium text-foreground">{userName} 님</span>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/my">마이페이지</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleLogout}>
            로그아웃
          </Button>
        </>
      )}
    </div>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useSession } from "./useSession";

export default function AuthActions() {
  const { session, supabaseClient } = useSession();

  const handleLogout = async () => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut({ scope: "global" });

    if (error?.name === "AuthSessionMissingError") {
      await supabaseClient.auth.signOut({ scope: "local" });
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
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/login">로그인</Link>
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

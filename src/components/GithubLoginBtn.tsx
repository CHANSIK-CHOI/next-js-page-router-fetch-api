import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { useSession } from "./useSession";

type GithubLoginBtnProps = {
  nextPath?: string;
};

export default function GithubLoginBtn({ nextPath = "/" }: GithubLoginBtnProps) {
  const { supabaseClient } = useSession();
  const redirectPath =
    typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  const handleLoginGithub = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
      },
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-2 rounded-full border-primary/30 bg-white/70 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70"
      onClick={handleLoginGithub}
    >
      <Image src="/icons/github.svg" alt="GitHub" width={18} height={18} className="dark:invert" />
      GitHub로 로그인
    </Button>
  );
}

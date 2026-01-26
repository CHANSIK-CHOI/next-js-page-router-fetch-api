import React from "react";
import Image from "next/image";
import styles from "@/pages/login/login.module.scss";
import classNames from "classnames/bind";
import { getSupabaseClient } from "@/lib/supabase.client";
const cx = classNames.bind(styles);

export default function GithubLoginBtn() {
  const supabaseClient = getSupabaseClient();

  const handleLoginGithub = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    console.log("Login", { data, error });
  };

  return (
    <button type="button" className={cx("auth__oauth")} onClick={handleLoginGithub}>
      <Image src="/icons/github.svg" alt="GitHub" width={18} height={18} />
      GitHub로 로그인
    </button>
  );
}

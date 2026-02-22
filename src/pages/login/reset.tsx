import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, useAlert } from "@/components/ui";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "@/components/useSession";
import { replaceSafely } from "@/lib/router.client";

type ResetPassword = {
  reset_password: string;
};

export default function PasswordResetPage() {
  const { openAlert } = useAlert();
  const { supabaseClient } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCode = new URLSearchParams(window.location.search).has("code");
    if (hasCode) setIsRecovery(true);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        setEmail(session?.user?.email ?? "");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPassword>({
    mode: "onSubmit",
    defaultValues: { reset_password: "" },
  });

  const onSubmit = async (values: ResetPassword) => {
    if (isSubmitting) return;
    if (!supabaseClient) return;
    if (!isRecovery) {
      openAlert({
        description: "복구 링크로 다시 접속해주세요.",
      });
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: values.reset_password,
    });

    if (error) {
      openAlert({
        description: "비밀번호 변경에 실패했습니다.",
      });
      return;
    }

    openAlert({
      description: "비밀번호가 변경되었습니다.\n다시 로그인해주세요.",
      onOk: () => {
        supabaseClient.auth.signOut();
        void replaceSafely(router, "/login");
      },
    });
  };

  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:cursor-not-allowed read-only:bg-muted/40 read-only:text-muted-foreground dark:border-white/10 dark:read-only:bg-white/5";

  return (
    <div className="mx-auto w-full max-w-xl">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-7 shadow-lg dark:border-white/10 dark:bg-neutral-900/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,160,160,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(120,120,120,0.12),transparent_70%)]"
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-foreground">
            Reset
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">비밀번호 재설정</h3>
          <p className="mt-2 text-sm text-muted-foreground">새 비밀번호를 입력하세요.</p>
        </div>

        <form className="relative z-10 mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="reset_email">
              이메일
            </label>
            <input
              id="reset_email"
              className={inputBase}
              type="email"
              placeholder="someone@email.com"
              readOnly
              value={email}
            />
            {!email && (
              <span className="text-xs text-destructive">복구 링크로 다시 접속해주세요.</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="reset_password">
              새 비밀번호
            </label>
            <input
              className={inputBase}
              type="password"
              placeholder="8자 이상 입력하세요"
              {...register("reset_password", {
                required: "필수 입력값입니다.",
                validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
              })}
            />
            {errors.reset_password && (
              <span className="text-xs text-destructive">{errors.reset_password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isSubmitting}>
              비밀번호 변경
            </Button>
          </div>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          로그인 화면으로 돌아가기{" "}
          <Link href="/login" className="font-semibold text-primary">
            로그인
          </Link>
        </div>
      </section>
    </div>
  );
}

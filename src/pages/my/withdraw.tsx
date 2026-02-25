import React, { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { User } from "@supabase/supabase-js";
import { Button, useAlert, useConfirm } from "@/components/ui";
import { useSession } from "@/components";
import { replaceSafely } from "@/lib/router.client";
import { useRouter } from "next/router";
import { inputBaseStyle } from "@/constants";
import { getAuthProviders } from "@/util";

type WithdrawForm = {
  confirm_text: string;
  password: string;
  agreement: boolean;
};

const WITHDRAW_CONFIRM_TEXT = "회원탈퇴";

const providerLabel = (provider: string) => {
  if (provider === "github") return "GitHub";
  if (provider === "email") return "이메일";
  return provider;
};

export default function WithdrawPage() {
  const { openAlert } = useAlert();
  const { openConfirm } = useConfirm();
  const { session, isInitSessionComplete } = useSession();
  const router = useRouter();
  const user = session?.user;
  const providers = getAuthProviders(user);

  const hasEmailProvider = providers.includes("email");
  const hasGithubProvider = providers.includes("github");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawForm>({
    mode: "onSubmit",
    defaultValues: {
      confirm_text: "",
      password: "",
      agreement: false,
    },
  });

  useEffect(() => {
    if (!isInitSessionComplete) return;
    if (session?.access_token) return;
    void replaceSafely(router, "/login?next=/my/withdraw");
  }, [isInitSessionComplete, router, session?.access_token]);

  const onSubmit = async (values: WithdrawForm) => {
    if (isSubmitting) return;

    const confirmed = await openConfirm({
      title: "회원 탈퇴 확인",
      description:
        "탈퇴하면 계정 데이터가 삭제되며 복구할 수 없습니다.\n정말로 회원 탈퇴를 진행하시겠어요?",
      actionText: "탈퇴 진행",
      cancelText: "취소",
    });

    if (!confirmed) return;

    void values;
    openAlert({
      description:
        "현재는 회원 탈퇴 UI만 준비된 상태입니다.\n다음 단계에서 서버 API 연동(auth admin delete)이 완료되면 실제 탈퇴가 동작합니다.",
    });
  };

  if (!isInitSessionComplete || !user) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-2xl border border-border/60 bg-background/80 p-7 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          로그인 상태를 확인하고 있습니다.
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-7 shadow-sm dark:border-destructive/50 dark:bg-destructive/10">
        <h2 className="text-2xl font-semibold text-foreground">회원 탈퇴</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          탈퇴 전 계정 정보를 확인하고, 안내에 따라 진행해주세요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {providers.map((provider) => (
            <span
              key={provider}
              className="rounded-full border border-destructive/30 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {providerLabel(provider)} 로그인
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-7 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground dark:border-white/10">
          <p>계정: {user.email ?? "-"}</p>
          {hasEmailProvider && (
            <p className="mt-2">이메일 로그인 계정은 비밀번호 확인이 필요합니다.</p>
          )}
          {hasGithubProvider && (
            <p className="mt-2">
              GitHub 로그인 계정은 연동 계정 기준으로 탈퇴되며, 동일 메일로 재가입 시 새 계정으로
              취급됩니다.
            </p>
          )}
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="withdraw_text">
              확인 문구 입력
            </label>
            <input
              id="withdraw_text"
              className={inputBaseStyle}
              type="text"
              placeholder={`정확히 '${WITHDRAW_CONFIRM_TEXT}'를 입력해주세요.`}
              {...register("confirm_text", {
                required: "확인 문구를 입력해주세요.",
                validate: (value) =>
                  value.trim() === WITHDRAW_CONFIRM_TEXT ||
                  `확인 문구는 '${WITHDRAW_CONFIRM_TEXT}'와 일치해야 합니다.`,
              })}
            />
            {errors.confirm_text && (
              <span className="text-xs text-destructive">{errors.confirm_text.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-muted-foreground"
              htmlFor="withdraw_password"
            >
              비밀번호 확인 {hasEmailProvider ? "(필수)" : "(선택)"}
            </label>
            <input
              id="withdraw_password"
              className={inputBaseStyle}
              type="password"
              placeholder={
                hasEmailProvider
                  ? "현재 비밀번호를 입력해주세요."
                  : "GitHub 로그인은 비워둘 수 있습니다."
              }
              {...register("password", {
                validate: (value) => {
                  if (!hasEmailProvider) return true;
                  return (
                    value.trim().length > 0 || "이메일 로그인 계정은 비밀번호 입력이 필요합니다."
                  );
                },
              })}
            />
            {errors.password && (
              <span className="text-xs text-destructive">{errors.password.message}</span>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-destructive"
              {...register("agreement", {
                validate: (value) => value || "주의사항을 확인하고 동의해주세요.",
              })}
            />
            <span>탈퇴 시 내 계정 데이터가 삭제되고 복구할 수 없다는 점에 동의합니다.</span>
          </label>
          {errors.agreement && (
            <span className="text-xs text-destructive">{errors.agreement.message}</span>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/my">돌아가기</Link>
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              회원 탈퇴
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

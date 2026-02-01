import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useForm, type FieldErrors } from "react-hook-form";
import { getSupabaseClient } from "@/lib/supabase.client";
import { EMAIL_PATTERN } from "@/constants";

type ForgotEmail = {
  forgot_email: string;
};

const getForgotErrorMessage = (message?: string) => {
  const normalized = (message ?? "").toLowerCase();
  if (
    normalized.includes("invalid email") ||
    normalized.includes("unable to validate email") ||
    normalized.includes("email address")
  ) {
    return "유효한 이메일 형식이 아닙니다.";
  }
  if (normalized.includes("email rate limit exceeded")) {
    return "인증 메일 발송 한도를 초과했습니다. 2시간 후에 다시 시도해주세요.";
  }
  if (normalized.includes("captcha")) {
    return "캡차 인증에 실패했습니다. 다시 시도해주세요.";
  }
  if (normalized.includes("user not found")) {
    return "가입되지 않은 이메일입니다.";
  }
  return "비밀번호 재설정 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.";
};
export default function PasswordResetPage() {
  const supabaseClient = getSupabaseClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotEmail>({
    mode: "onSubmit",
    defaultValues: { forgot_email: "" },
  });

  const onSubmit = async (values: ForgotEmail) => {
    if (isSubmitting) return;
    if (!supabaseClient) return;

    console.log(`${window.location.origin}`);
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(values.forgot_email, {
      redirectTo: `${window.location.origin}/login/reset`,
    });

    console.log({ data, error }, values.forgot_email);
    if (error) {
      console.error(error.message);
      alert(getForgotErrorMessage(error.message));
      return;
    }

    alert("이메일로 인증 링크가 전송되었습니다. 확인 후 비밀번호를 변경해주세요.");
  };

  const onError = (errors: FieldErrors<ForgotEmail>) => {
    console.error("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
  };

  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

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
          <p className="mt-2 text-sm text-muted-foreground">
            비밀번호 재설정 할 이메일을 입력하세요.
          </p>
        </div>

        <form
          className="relative z-10 mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="forgot_email">
              이메일
            </label>
            <input
              className={inputBase}
              type="email"
              placeholder="someone@email.com"
              {...register("forgot_email", {
                required: "필수 입력값입니다.",
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "유효한 이메일 형식이 아닙니다.",
                },
              })}
            />
            {errors.forgot_email && (
              <span className="text-xs text-destructive">{errors.forgot_email.message}</span>
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

import React from "react";
import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./login.module.scss";
import GithubLoginBtn from "@/components/GithubLoginBtn";
import { useForm, type FieldErrors } from "react-hook-form";
import { EMAIL_PATTERN, LOGIN_EMAIL_FORM } from "@/constants";
import { LoginForm } from "@/types";
import { getSupabaseClient } from "@/lib/supabase.client";
import { useRouter } from "next/router";

const cx = classNames.bind(styles);

const getLoginErrorMessage = (message?: string) => {
  const normalized = (message ?? "").toLowerCase();
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid_credentials")) {
    return "이메일 또는 비밀번호를 확인해주세요.";
  }
  if (normalized.includes("email not confirmed")) {
    return "이메일 인증 후 로그인해주세요.";
  }
  return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
};

export default function LoginPage() {
  const supabaseClient = getSupabaseClient();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    mode: "onSubmit",
    defaultValues: LOGIN_EMAIL_FORM,
  });

  const onSubmit = async (values: LoginForm) => {
    if (isSubmitting) return;
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: values.login_email.trim(),
      password: values.login_password,
    });

    console.log({ data, error });
    if (error) {
      alert(getLoginErrorMessage(error.message));
      return;
    }

    await router.replace("/");
  };

  const onError = (errors: FieldErrors<LoginForm>) => {
    console.error("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
  };

  return (
    <div className={cx("auth")}>
      <section className={cx("auth__card")}>
        <div className={cx("auth__cardHeader")}>
          <span className={cx("auth__kicker")}>Login</span>
          <h3 className={cx("auth__title")}>로그인</h3>
          <p className={cx("auth__subtitle")}>이메일과 비밀번호로 시작하세요.</p>
        </div>

        <form className={cx("auth__form")} onSubmit={handleSubmit(onSubmit, onError)}>
          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="login_email">
              이메일
            </label>
            <input
              className={cx("auth__input")}
              type="email"
              placeholder="someone@email.com"
              {...register("login_email", {
                required: "필수 입력값입니다.",
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "유효한 이메일 형식이 아닙니다.",
                },
              })}
            />
            {errors.login_email && <span className="error-msg">{errors.login_email.message}</span>}
          </div>

          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="login_password">
              비밀번호
            </label>
            <input
              className={cx("auth__input")}
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register("login_password", {
                required: "필수 입력값입니다.",
                validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
              })}
            />
            {errors.login_password && (
              <span className="error-msg">{errors.login_password.message}</span>
            )}
          </div>

          <div className={cx("auth__metaRow")}>
            <span>비밀번호를 잊으셨나요?</span>
            <Link href="/login/reset">비밀번호 재설정</Link>
          </div>

          <div className={cx("auth__actions")}>
            <button type="submit" className="btn btn--solid">
              로그인
            </button>

            <div className={cx("auth__divider")}>또는</div>

            <GithubLoginBtn />
          </div>
        </form>

        <div className={cx("auth__footer")}>
          아직 계정이 없나요? <Link href="/login/signup">회원가입</Link>
        </div>
      </section>
    </div>
  );
}

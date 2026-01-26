import React from "react";
import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./login.module.scss";
import GithubLoginBtn from "@/components/GithubLoginBtn";
import { useForm, type FieldErrors } from "react-hook-form";
import { SingUpForm } from "@/types";
import { EMAIL_PATTERN, PHONE_PATTERN, SINGUP_EMAIL_FORM } from "@/constants";
import { getSupabaseClient } from "@/lib/supabase.client";
import { useRouter } from "next/router";
import { checkEmailDuplicate } from "@/lib/checkEmailDuplicate";

const cx = classNames.bind(styles);

const getSignupErrorMessage = (message?: string) => {
  const normalized = (message ?? "").toLowerCase();
  console.log({ normalized });
  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "이미 가입된 이메일입니다.";
  }
  if (normalized.includes("invalid email")) {
    return "유효한 이메일 형식이 아닙니다.";
  }
  if (
    normalized.includes("password should be at least") ||
    normalized.includes("password is too short")
  ) {
    return "비밀번호는 더 길게 입력해주세요.";
  }
  if (normalized.includes("email rate limit exceeded")) {
    return "인증 메일 발송 한도를 초과했습니다. 2시간 후에 다시 시도해주세요.";
  }
  return "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
};

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value.trim();
};

export default function SignupPage() {
  const supabaseClient = getSupabaseClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SingUpForm>({
    mode: "onSubmit",
    defaultValues: SINGUP_EMAIL_FORM,
  });

  const onSubmit = async (values: SingUpForm) => {
    if (isSubmitting) return;
    if (!supabaseClient) return;

    const trimmedName = values.signup_name?.trim();
    const trimmedPhone = values.signup_phone?.trim();
    const userMetadata: Record<string, string> = {};

    if (trimmedName) userMetadata.name = trimmedName;
    if (trimmedPhone) userMetadata.phone = formatPhoneNumber(trimmedPhone);

    const { data, error } = await supabaseClient.auth.signUp({
      email: values.signup_email,
      password: values.signup_password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: userMetadata,
      },
    });

    console.log({ data, error });

    if (error) {
      alert(getSignupErrorMessage(error.message));
      return;
    }

    if (data.session) {
      await supabaseClient.auth.signOut();
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      await router.replace("/login");
      return;
    }

    alert("이메일로 인증 링크가 전송되었습니다. 확인 후 로그인 해주세요.");
    await router.replace("/login");
  };

  const onError = (errors: FieldErrors<SingUpForm>) => {
    console.error("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
    // 테스트
  };

  return (
    <div className={cx("auth")}>
      <section className={cx("auth__card")}>
        <div className={cx("auth__cardHeader")}>
          <span className={cx("auth__kicker")}>Sign Up</span>
          <h3 className={cx("auth__title")}>회원가입</h3>
          <p className={cx("auth__subtitle")}>필수 정보는 이메일과 비밀번호예요.</p>
        </div>

        <form className={cx("auth__form")} onSubmit={handleSubmit(onSubmit, onError)}>
          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="signup_name">
              이름 (선택)
            </label>
            <input
              className={cx("auth__input")}
              type="text"
              placeholder="홍길동"
              {...register("signup_name", {
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
              })}
            />
          </div>

          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="signup_phone">
              휴대폰 번호 (선택)
            </label>
            <input
              className={cx("auth__input")}
              type="tel"
              placeholder="하이픈 없이 입력해주세요"
              {...register("signup_phone", {
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                validate: (value) => {
                  if (!value) return true;
                  const digits = String(value).replace(/\D/g, "");
                  return (
                    digits.length === 10 ||
                    digits.length === 11 ||
                    "휴대폰 번호 형식이 올바르지 않습니다."
                  );
                },
              })}
            />
            {errors.signup_phone && (
              <span className="error-msg">{errors.signup_phone.message}</span>
            )}
          </div>

          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="signup_email">
              이메일
            </label>
            <input
              className={cx("auth__input")}
              type="email"
              placeholder="someone@email.com"
              {...register("signup_email", {
                required: "필수 입력값입니다.",
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "유효한 이메일 형식이 아닙니다.",
                },
              })}
            />
            {errors.signup_email && (
              <span className="error-msg">{errors.signup_email.message}</span>
            )}
          </div>

          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="signup_password">
              비밀번호
            </label>
            <input
              className={cx("auth__input")}
              type="password"
              placeholder="8자 이상 입력하세요"
              {...register("signup_password", {
                required: "필수 입력값입니다.",
                validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
              })}
            />
            {errors.signup_password && (
              <span className="error-msg">{errors.signup_password.message}</span>
            )}
          </div>

          <div className={cx("auth__actions")}>
            <button type="submit" className="btn btn--solid btn--warm">
              회원가입
            </button>

            <div className={cx("auth__divider")}>또는</div>

            <GithubLoginBtn />
          </div>
        </form>

        <div className={cx("auth__footer")}>
          이미 계정이 있나요? <Link href="/login">로그인</Link>
        </div>
      </section>
    </div>
  );
}

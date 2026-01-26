import React from "react";
import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./login.module.scss";
import GithubLoginBtn from "@/components/GithubLoginBtn";
import { useForm, type FieldErrors } from "react-hook-form";
import { SingUpForm } from "@/types";
import { EMAIL_PATTERN, SINGUP_EMAIL_FORM } from "@/constants";
import { getSupabaseClient } from "@/lib/supabase.client";
import { useRouter } from "next/router";

const cx = classNames.bind(styles);

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

    const { data, error } = await supabaseClient.auth.signUp({
      email: values.signup_email,
      password: values.signup_password,
    });

    console.log({ data, error });
    if (!error) {
      alert("회원가입이 완료되었습니다. 가입하신 정보로 로그인해주세요.");
      router.push("/login");
    }
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
              {...register("signup_name")}
            />
          </div>

          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="signup_phone">
              휴대폰 번호 (선택)
            </label>
            <input
              className={cx("auth__input")}
              type="tel"
              placeholder="010-1234-5678"
              {...register("signup_phone")}
            />
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

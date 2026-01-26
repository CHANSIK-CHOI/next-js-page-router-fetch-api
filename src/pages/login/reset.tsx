import React from "react";
import classNames from "classnames/bind";
import Link from "next/link";
import styles from "./login.module.scss";

const cx = classNames.bind(styles);

export default function PasswordResetPage() {
  return (
    <div className={cx("auth")}>
      <section className={cx("auth__card")}>
        <div className={cx("auth__cardHeader")}>
          <span className={cx("auth__kicker")}>Reset</span>
          <h3 className={cx("auth__title")}>비밀번호 재설정</h3>
          <p className={cx("auth__subtitle")}>새 비밀번호를 입력하세요.</p>
        </div>

        <form className={cx("auth__form")}>
          <div className={cx("auth__field")}>
            <label className={cx("auth__label")} htmlFor="reset_password">
              새 비밀번호
            </label>
            <input
              id="reset_password"
              className={cx("auth__input")}
              type="password"
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>

          <div className={cx("auth__actions")}>
            <button type="submit" className="btn btn--solid">
              비밀번호 변경
            </button>
          </div>
        </form>

        <div className={cx("auth__footer")}>
          로그인 화면으로 돌아가기 <Link href="/login">로그인</Link>
        </div>
      </section>
    </div>
  );
}

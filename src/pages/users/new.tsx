import React from "react";
import classNames from "classnames/bind";
import styles from "./new-page.module.scss";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
const cx = classNames.bind(styles);

export default function NewPage() {
  return (
    <div className={cx("new")}>
      <div className={cx("new__head")}>
        <div className={cx("new__actions")}>
          <Link href={`/`} className="btn btn--line">
            뒤로가기
          </Link>
          <button type="button" className="btn btn--solid btn--warm">
            추가하기
          </button>
        </div>
      </div>
      <div className={cx("new__body")}>
        <div className={cx("new__box")}>
          <div className={cx("new__profile")}>
            <Image
              src={PLACEHOLDER_SRC}
              alt=""
              width={120}
              height={120}
              unoptimized
            />

            <div className={cx("new__profileBtn")}>
              <label htmlFor={`new_avatar`}>프로필 변경</label>
              <button type="button">프로필 삭제</button>
              <input id={`new_avatar`} type="file" accept="image/*" hidden />
            </div>
          </div>

          <div className={cx("new__texts")}>
            <dl>
              <dt>이름</dt>
              <dd>
                <input type="text" placeholder="first name" />
                <input type="text" placeholder="last name" />
              </dd>
            </dl>
            <dl>
              <dt>email</dt>
              <dd>
                <input type="text" placeholder="email" />
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

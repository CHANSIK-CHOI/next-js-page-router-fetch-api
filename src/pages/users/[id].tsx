import React from "react";
import classNames from "classnames/bind";
import styles from "./detail-page.module.scss";
import Image from "next/image";
import users from "@/mock/users.json";
import { PLACEHOLDER_SRC } from "@/constants";
import { useRouter } from "next/router";
import Link from "next/link";
const cx = classNames.bind(styles);

export default function DetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const target = users.find((u) => u.id === Number(id));

  if (!target) return <div>Loading ...</div>;

  const { avatar, first_name, last_name, email } = target;

  return (
    <div className={cx("detail")}>
      <div className={cx("detail__head")}>
        <div className={cx("detail__actions")}>
          <Link href={`/`} className="btn btn--line">
            뒤로가기
          </Link>
          <Link href={`/users/${id}/edit`} className="btn btn--solid">
            수정하기
          </Link>
          <button type="button" className="btn btn--solid btn--danger">
            삭제하기
          </button>
        </div>
      </div>
      <div className={cx("detail__body")}>
        <div className={cx("detail__box")}>
          <div className={cx("detail__profile")}>
            <Image
              src={avatar || PLACEHOLDER_SRC}
              alt=""
              width={120}
              height={120}
              unoptimized={!avatar}
            />
          </div>

          <div className={cx("detail__texts")}>
            <dl>
              <dt>이름</dt>
              <dd>
                {first_name} {last_name}
              </dd>
            </dl>
            <dl>
              <dt>email</dt>
              <dd>{email}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import classNames from "classnames/bind";
import styles from "./detail-page.module.scss";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { useRouter } from "next/router";
import Link from "next/link";
import { getUserApi } from "@/lib/users.api";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { User } from "@/types";
const cx = classNames.bind(styles);

export const getStaticPaths = async () => {
  const { data } = await getUserApi<User[]>();

  return {
    paths: data.map((user) => ({
      params: { id: String(user.id) },
    })),
    fallback: true,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const id = context.params!.id;
  const { data: user } = await getUserApi<User>(Number(id));
  return {
    props: { user },
  };
};

export default function DetailPage({ user }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading ...</div>;
  }
  if (!user) return "문제가 발생했습니다. 다시 시도하세요.";

  const { avatar, first_name, last_name, email, id } = user;

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

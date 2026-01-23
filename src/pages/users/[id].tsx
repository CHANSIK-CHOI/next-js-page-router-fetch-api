import React, { useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./detail-page.module.scss";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { isErrorAlertMsg } from "@/types";
import { getUserApi } from "@/lib/users.server";
const cx = classNames.bind(styles);

export const getStaticPaths = async () => {
  try {
    const { data } = await getUserApi();
    return {
      paths: data.map((user) => ({ params: { id: String(user.id) } })),
      fallback: true, // 또는 "blocking"
    };
  } catch (err) {
    console.error(err);
    return { paths: [], fallback: true };
  }
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  try {
    const id = context.params!.id;

    const { data: user } = await getUserApi(String(id));
    if (!user) {
      return { notFound: true };
    }
    return {
      props: { user },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;

    return { props: { user: null, userMessage } };
  }
};

export default function DetailPage({
  user,
  userMessage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const hasAlertedRef = useRef(false);
  useEffect(() => {
    if (userMessage && !hasAlertedRef.current) {
      console.error(userMessage);
      alert(userMessage);
      hasAlertedRef.current = true;
    }
  }, [userMessage]);

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

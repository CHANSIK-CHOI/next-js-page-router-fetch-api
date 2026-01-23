import React, { useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./edit-page.module.scss";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { isErrorAlertMsg } from "@/types";
import { getUserApi } from "@/lib/users.server";
const cx = classNames.bind(styles);

export const getStaticPaths = async () => {
  try {
    const { data } = await getUserApi();
    return {
      paths: data.map((user) => ({
        params: { id: String(user.id) },
      })),
      fallback: true,
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
    return {
      props: { user },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;

    return { props: { user: null, userMessage } };
  }
};

export default function EditPage({
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

  const { avatar, id } = user;

  return (
    <div className={cx("edit")}>
      <div className={cx("edit__head")}>
        <div className={cx("edit__actions")}>
          <Link href={`/users/${id}`} className="btn btn--line">
            수정취소
          </Link>
          <button type="button" className="btn btn--solid">
            수정완료
          </button>
        </div>
      </div>
      <div className={cx("edit__body")}>
        <div className={cx("edit__box")}>
          <div className={cx("edit__profile")}>
            <Image
              src={avatar || PLACEHOLDER_SRC}
              alt=""
              width={120}
              height={120}
              unoptimized={!avatar}
            />
            <div className={cx("edit__profileBtn")}>
              <label htmlFor={`avatar_${id}`}>프로필 변경</label>
              <button type="button">프로필 삭제</button>
              <input id={`avatar_${id}`} type="file" accept="image/*" hidden />
            </div>
          </div>

          <div className={cx("edit__texts")}>
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

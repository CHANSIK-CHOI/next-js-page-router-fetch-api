import React from "react";
import classNames from "classnames/bind";
import styles from "./edit-page.module.scss";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { User } from "@/types";
import { getUserApi } from "@/lib/users.server";
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
  const { data: user } = await getUserApi<User>(String(id));
  return {
    props: { user },
  };
};

export default function EditPage({ user }: InferGetStaticPropsType<typeof getStaticProps>) {
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

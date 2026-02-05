import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { isErrorAlertMsg } from "@/types";
import { getUserApi } from "@/lib/users.server";
import { Button } from "@/components/ui";

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

  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/users/${id}`}>수정취소</Link>
        </Button>
        <Button type="button">수정완료</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-3">
            <Image
              src={avatar || PLACEHOLDER_SRC}
              alt=""
              width={140}
              height={140}
              unoptimized={!avatar}
              className="h-[140px] w-[140px] rounded-2xl border border-border/60 bg-muted object-cover dark:border-white/10"
            />
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-center">
                <label htmlFor={`avatar_${id}`} className="cursor-pointer">
                  프로필 변경
                </label>
              </Button>
              <Button type="button" variant="ghost" size="sm">
                프로필 삭제
              </Button>
              <input id={`avatar_${id}`} type="file" accept="image/*" hidden />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <dl className="grid gap-3">
              <dt className="text-sm font-semibold text-muted-foreground">이름</dt>
              <dd className="grid gap-3 sm:grid-cols-2">
                <input type="text" placeholder="name" className={inputBase} />
              </dd>
            </dl>
            <dl className="grid gap-3">
              <dt className="text-sm font-semibold text-muted-foreground">phone</dt>
              <dd className="grid gap-3 sm:grid-cols-2">
                <input type="text" placeholder="phone" className={inputBase} />
              </dd>
            </dl>
            <dl className="grid gap-3">
              <dt className="text-sm font-semibold text-muted-foreground">email</dt>
              <dd>
                <input type="text" placeholder="email" className={inputBase} />
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { isErrorAlertMsg } from "@/types";
import { getUserApi } from "@/lib/users.server";
import { Button } from "@/components/ui";
import { formatDateTime } from "@/util";

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

  const { avatar, name, phone, email, id, created_at, updated_at } = user;
  const isUpdated = String(updated_at) !== String(created_at);
  const dateLabel = isUpdated ? "수정 날짜" : "작성 날짜";
  const dateText = formatDateTime(isUpdated ? updated_at : created_at);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/`}>뒤로가기</Link>
        </Button>
        <Button asChild>
          <Link href={`/users/${id}/edit`}>수정하기</Link>
        </Button>
        <Button type="button" variant="destructive">
          삭제하기
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="mb-4 flex justify-end">
          <div className="text-xs text-muted-foreground">
            <span className="mr-1">{dateLabel}</span>
            <span className="font-medium text-foreground/80">{dateText}</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-[160px_1fr] md:items-center">
          <div className="h-[140px] w-[140px] overflow-hidden rounded-2xl border border-border/60 bg-muted dark:border-white/10">
            <Image
              src={avatar || PLACEHOLDER_SRC}
              alt={`${name}의 프로필`}
              width={140}
              height={140}
              unoptimized={!avatar}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <dl className="grid gap-2">
              <dt className="text-sm font-semibold text-muted-foreground">이름</dt>
              <dd className="text-base font-semibold text-foreground">{name}</dd>
            </dl>
            {phone && (
              <dl className="grid gap-2">
                <dt className="text-sm font-semibold text-muted-foreground">휴대폰 번호</dt>
                <dd className="text-base font-semibold text-foreground">{phone}</dd>
              </dl>
            )}
            <dl className="grid gap-2">
              <dt className="text-sm font-semibold text-muted-foreground">이메일</dt>
              <dd className="text-base font-semibold text-foreground">{email}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

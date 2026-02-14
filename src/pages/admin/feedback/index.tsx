import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, useAlert } from "@/components/ui";
import { InferGetStaticPropsType } from "next";

export const getStaticProps = async () => {
  try {
    return {
      props: {
        // pendingData: [],
        alertMessage: null,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        // pendingData: [],
        alertMessage: "데이터를 정상적으로 불러올 수 없습니다.",
      },
    };
  }
};
export default function AdminFeedbackPage({
  // pendingData,
  alertMessage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const hasAlertedRef = useRef(false);
  const { openAlert } = useAlert();
  const [viewType, setViewType] = useState<"all" | "pending">("all");

  useEffect(() => {
    if (alertMessage && !hasAlertedRef.current) {
      openAlert({
        description: alertMessage,
      });
      hasAlertedRef.current = true;
    }
  }, [alertMessage, openAlert]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              관리자
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">피드백 검토 큐</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              승인 대기 및 수정된 피드백을 검토하고 공개 여부를 결정합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback">공개 보드</Link>
            </Button>
            {viewType !== "all" ? (
              <Button type="button" onClick={() => setViewType("all")}>
                전체 보기
              </Button>
            ) : (
              <Button type="button" onClick={() => setViewType("pending")}>
                승인 대기만 보기
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            대기
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">2</strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            수정 대기
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">1</strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            이번 주 승인
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">6</strong>
        </div>
      </section>

      <section className="grid gap-4">
        {/* {pendingData.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                  {item.status === "revised_pending" ? "수정 승인 대기" : "승인 대기"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(item.created_at)} 등록
                </span>
              </div>
              <span className="text-sm font-semibold text-amber-500">
                {ratingStars(item.rating ?? 0)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
                  <Image
                    src={item.avatar_url || PLACEHOLDER_SRC}
                    alt={`${item.display_name} avatar`}
                    width={40}
                    height={40}
                    unoptimized={!item.avatar_url}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-base font-semibold text-foreground">{item.display_name}</span>
                {item.is_company_public && item.company_name && (
                  <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
                    {item.company_name}
                  </span>
                )}
              </div>
              <p className="text-base text-foreground">{item.summary}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/feedback/${item.id}`}>상세 보기</Link>
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm">
                  비공개
                </Button>
                <Button type="button" variant="outline" size="sm">
                  반려
                </Button>
                <Button type="button" size="sm">
                  승인
                </Button>
              </div>
            </div>
          </article>
        ))} */}
      </section>
    </div>
  );
}

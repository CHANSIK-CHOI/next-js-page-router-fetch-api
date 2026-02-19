import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button, useAlert } from "@/components/ui";
import { useSession } from "@/components/useSession";
import { PLACEHOLDER_SRC } from "@/constants";
import { formatDateTime, ratingStars, statusBadge, statusLabel } from "@/util";
import type { AdminReviewFeedbackWithEmail } from "@/types";

type ViewType = "all" | "pending";

const STATUS_BY_VIEW: Record<ViewType, string> = {
  all: "approved,pending,revised_pending,rejected",
  pending: "pending,revised_pending",
};

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { openAlert } = useAlert();
  const { session, isAdminUi, isRoleLoading } = useSession();
  const [viewType, setViewType] = useState<ViewType>("all");
  const [feedbacks, setFeedbacks] = useState<AdminReviewFeedbackWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasBlockedRef = useRef(false);

  const statusQuery = useMemo(() => {
    return new URLSearchParams({
      status: STATUS_BY_VIEW[viewType],
    }).toString();
  }, [viewType]);

  useEffect(() => {
    if (isRoleLoading || isAdminUi || hasBlockedRef.current) return;

    hasBlockedRef.current = true;
    openAlert({
      description: "관리자만 접근 가능한 페이지입니다.",
      onOk: () => {
        router.replace("/feedback");
      },
    });
  }, [isRoleLoading, isAdminUi, openAlert, router]);

  useEffect(() => {
    if (isRoleLoading || !isAdminUi || !session?.access_token) {
      setFeedbacks([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadFeedbacks = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/admin/feedbacks?${statusQuery}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result: { data: AdminReviewFeedbackWithEmail[] | null; error: string | null } =
          await response.json().catch(() => ({}));

        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Failed to fetch admin feedbacks");
        }

        if (controller.signal.aborted) return;
        setFeedbacks(result.data ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "피드백 데이터를 불러오지 못했습니다.";
        setLoadError(message);
        setFeedbacks([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadFeedbacks();

    return () => controller.abort();
  }, [isRoleLoading, isAdminUi, session?.access_token, statusQuery]);

  const pendingCount = feedbacks.filter((item) => item.status === "pending").length;
  const revisedPendingCount = feedbacks.filter((item) => item.status === "revised_pending").length;
  const rejectedCount = feedbacks.filter((item) => item.status === "rejected").length;

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
              관리자 전용 목록입니다. 이메일 포함 전체 데이터를 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback">공개 보드</Link>
            </Button>
            <Button
              type="button"
              variant={viewType === "all" ? "default" : "outline"}
              onClick={() => setViewType("all")}
            >
              전체 보기
            </Button>
            <Button
              type="button"
              variant={viewType === "pending" ? "default" : "outline"}
              onClick={() => setViewType("pending")}
            >
              승인 대기만
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            전체
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {feedbacks.length}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            승인 대기
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {pendingCount}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            수정 승인 대기
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {revisedPendingCount}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            반려
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {rejectedCount}
          </strong>
        </div>
      </section>

      <section className="grid gap-4">
        {isLoading && (
          <div className="rounded-2xl border border-border/60 bg-background/80 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-neutral-900/70">
            데이터를 불러오는 중입니다...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-sm text-rose-600 dark:text-rose-300">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && feedbacks.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-background/80 p-6 text-sm text-muted-foreground dark:border-white/10 dark:bg-neutral-900/70">
            검토할 피드백이 없습니다.
          </div>
        )}

        {!isLoading &&
          !loadError &&
          feedbacks.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(item.status)}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    마지막 수정: {formatDateTime(item.updated_at)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-500">
                  {ratingStars(item.rating)}
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
                  <span className="text-base font-semibold text-foreground">
                    {item.display_name}
                  </span>
                  {item.is_company_public && item.company_name && (
                    <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
                      {item.company_name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">작성자 이메일: {item.email}</p>
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
                  {item.status === "pending" || item.status === "revised_pending" ? (
                    <>
                      <Button type="button" variant="outline" size="sm">
                        반려
                      </Button>
                      <Button type="button" size="sm">
                        승인
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}

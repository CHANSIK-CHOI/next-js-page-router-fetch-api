import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, useAlert } from "@/components/ui";
import { PLACEHOLDER_SRC } from "@/constants";
import { getApprovedFeedbacksApi } from "@/lib/users.server";
import { cn } from "@/lib/utils";
import { InferGetStaticPropsType } from "next";
import { useSession } from "@/components/useSession";
import { UserRole } from "@/types";

const statusBadge = (status: string) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }
  if (status === "revised_pending") {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  }
  return "bg-slate-500/15 text-slate-600 dark:text-slate-300";
};

const statusLabel = (status: string) => {
  if (status === "approved") return "승인됨";
  if (status === "revised_pending") return "승인 대기(수정됨)";
  return "승인 대기";
};

const renderStars = (rating: number) => {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(rating);
};

export const getStaticProps = async () => {
  try {
    return {
      props: { approvedData: await getApprovedFeedbacksApi(), alertMessage: null },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        approvedData: [],
        alertMessage: "데이터를 정상적으로 불러올 수 없습니다.",
      },
    };
  }
};

export default function FeedbackBoardPage({
  approvedData,
  alertMessage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const hasAlertedRef = useRef(false);
  const { openAlert } = useAlert();
  const { session, isSessionInit } = useSession();
  const [isAdminUi, setIsAdminUi] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    if (isSessionInit) return;
    if (!session?.access_token) {
      setIsAdminUi(false);
      setPendingCount(null);
      return;
    }

    const controller = new AbortController();

    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/user-roles", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });
        const result: { role?: UserRole["role"] | null; error?: string | null } =
          await response.json().catch(() => ({}));
        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Failed to fetch user role");
        }
        setIsAdminUi(result.role === "admin");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to get user role", error);
        setIsAdminUi(false);
      }
    };

    checkAdmin();

    return () => {
      controller.abort();
    };
  }, [isSessionInit, session?.access_token]);

  useEffect(() => {
    if (!isAdminUi || !session?.access_token) {
      setPendingCount(null);
      return;
    }

    let isMounted = true;

    const loadPendingCount = async () => {
      try {
        const response = await fetch("/api/feedbacks/pending-count", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const result: { count?: number; error?: string } = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? "Failed to fetch pending count");
        }
        if (!isMounted) return;
        setPendingCount(typeof result.count === "number" ? result.count : 0);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to get pending count", error);
        setPendingCount(null);
      }
    };

    loadPendingCount();

    return () => {
      isMounted = false;
    };
  }, [isAdminUi, session?.access_token]);

  useEffect(() => {
    if (alertMessage && !hasAlertedRef.current) {
      console.error(alertMessage);
      openAlert({
        description: alertMessage,
      });
      hasAlertedRef.current = true;
    }
  }, [alertMessage]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">인터뷰어 피드백 보드</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              승인된 피드백은 공개 보드에 노출되고, 승인 대기 중인 피드백은 상태 배지가 표시됩니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback/new">피드백 남기기</Link>
            </Button>
            {isAdminUi && (
              <Button asChild>
                <Link href="/admin/feedback">관리자 보기</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section
        className={cn("grid gap-4", {
          "md:grid-cols-3": isAdminUi,
          "md:grid-cols-2": !isAdminUi,
        })}
      >
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            전체
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {approvedData.length + (isAdminUi ? pendingCount ?? 0 : 0)}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            승인됨
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {approvedData.length}
          </strong>
        </div>
        {isAdminUi && (
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              승인 대기
            </p>
            <strong className="mt-2 block text-2xl font-semibold text-foreground">
              {pendingCount ?? "-"}
            </strong>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        {approvedData.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                    item.status
                  )}`}
                >
                  {statusLabel(item.status)}
                </span>
                <span className="text-xs text-muted-foreground">{item.created_at} 등록</span>
              </div>
              <span className="text-sm font-semibold text-amber-500">
                {renderStars(item.rating)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
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
                <span className="text-xs">수정 {item.revision_count}회</span>
              </div>
              <p className="text-base text-foreground">{item.summary}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/feedback/${item.id}`}>상세 보기</Link>
              </Button>
              <span className="text-xs text-muted-foreground">마지막 수정 {item.updated_at}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

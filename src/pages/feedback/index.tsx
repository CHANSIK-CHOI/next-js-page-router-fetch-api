import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button, useAlert } from "@/components/ui";
import { getApprovedFeedbacksApi, getRevisedPendingPreviewApi } from "@/lib/feedback.server";
import { cn } from "@/lib/utils";
import { InferGetStaticPropsType } from "next";
import { useSession } from "@/components/useSession";
import { formatDateTime, mergeFeedbackList, statusBadge, statusLabel } from "@/util";
import { FeedbackBox } from "@/components";
import { AdminReviewFeedback, RevisedPendingOwnerFeedback } from "@/types";

const MINE_STATUS_QUERY = new URLSearchParams({
  status: "pending,revised_pending",
}).toString();

const ADMIN_REVIEW_STATUS_QUERY = new URLSearchParams({
  status: "pending,revised_pending,rejected",
}).toString();

export const getStaticProps = async () => {
  try {
    const approvedFeedbacksData = await getApprovedFeedbacksApi();
    const revisedPendingPreviewData = await getRevisedPendingPreviewApi();

    return {
      props: { approvedFeedbacksData, revisedPendingPreviewData, alertMessage: null },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        approvedFeedbacksData: [],
        revisedPendingPreviewData: [],
        alertMessage: "데이터를 정상적으로 불러올 수 없습니다.",
      },
    };
  }
};

export default function FeedbackBoardPage({
  approvedFeedbacksData,
  revisedPendingPreviewData,
  alertMessage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const hasAlertedRef = useRef(false);
  const { openAlert } = useAlert();
  const { session, isAdminUi, isRoleLoading } = useSession();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [ownerPendingFeedbacks, setOwnerPendingFeedbacks] = useState<RevisedPendingOwnerFeedback[]>(
    []
  );
  const [adminReviewFeedbacks, setAdminReviewFeedbacks] = useState<AdminReviewFeedback[]>([]);
  const feedbackData = useMemo(
    () =>
      mergeFeedbackList({
        approved: approvedFeedbacksData,
        revisedPreview: revisedPendingPreviewData,
        revisedMine: ownerPendingFeedbacks,
        adminReview: adminReviewFeedbacks,
      }),
    [approvedFeedbacksData, revisedPendingPreviewData, ownerPendingFeedbacks, adminReviewFeedbacks]
  );

  console.log({ feedbackData });

  useEffect(() => {
    if (alertMessage && !hasAlertedRef.current) {
      openAlert({
        description: alertMessage,
      });
      hasAlertedRef.current = true;
    }
  }, [alertMessage, openAlert]);

  // admin 사용자 : 승인 대기 중 count 가져오기
  useEffect(() => {
    if (isRoleLoading || !isAdminUi || !session?.access_token) {
      setPendingCount(null);
      return;
    }

    const controller = new AbortController();
    const loadPendingCount = async () => {
      try {
        const response = await fetch("/api/feedbacks/pending-count", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result: { count: number | null; error: string | null } = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Failed to fetch pending count");
        }

        if (typeof result.count !== "number") {
          throw new Error("Invalid pending count response");
        }

        if (controller.signal.aborted) return;
        setPendingCount(result.count);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setPendingCount(null);
      }
    };
    loadPendingCount();

    return () => controller.abort();
  }, [isRoleLoading, isAdminUi, session?.access_token]);

  // 로그인 시 본인이 작성한 게시물 중 "pending" 이나 "revised_pending"은 전체 데이터를 가져와 merge 하기
  useEffect(() => {
    if (!session?.access_token) {
      setOwnerPendingFeedbacks([]);
      return;
    }
    const controller = new AbortController();
    const getPendingOwnerFeedback = async () => {
      try {
        const response = await fetch(`/api/feedbacks/mine?${MINE_STATUS_QUERY}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result: { data: RevisedPendingOwnerFeedback[] | null; error: string | null } =
          await response.json().catch(() => ({}));

        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Select failed Owner Pending Data");
        }

        if (controller.signal.aborted) return;
        setOwnerPendingFeedbacks(result.data ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setOwnerPendingFeedbacks([]);
      }
    };
    getPendingOwnerFeedback();

    return () => controller.abort();
  }, [session?.access_token]);

  useEffect(() => {
    if (isRoleLoading || !isAdminUi || !session?.access_token) {
      setAdminReviewFeedbacks([]);
      return;
    }

    const controller = new AbortController();
    const getAdminReviewFeedbacks = async () => {
      try {
        const response = await fetch(`/api/feedbacks?${ADMIN_REVIEW_STATUS_QUERY}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result: { data: AdminReviewFeedback[] | null; error: string | null } = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Failed to fetch admin review feedbacks");
        }
        if (controller.signal.aborted) return;
        setAdminReviewFeedbacks(result.data ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setAdminReviewFeedbacks([]);
      }
    };

    getAdminReviewFeedbacks();
    return () => controller.abort();
  }, [isRoleLoading, isAdminUi, session?.access_token]);

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
            {!isRoleLoading && isAdminUi && (
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
            {feedbackData.length}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            승인됨
          </p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {approvedFeedbacksData.length}
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
        {feedbackData.map((item) => {
          return <FeedbackBox data={item} key={item.id} />;
        })}
      </section>

      {isAdminUi && (
        <section className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">관리자 검토 큐</h3>
            <span className="text-sm text-muted-foreground">{adminReviewFeedbacks.length}건</span>
          </div>

          {adminReviewFeedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">검토할 비승인 피드백이 없습니다.</p>
          ) : (
            <div className="grid gap-3">
              {adminReviewFeedbacks.map((item) => (
                <article
                  key={`admin-review-${item.id}`}
                  className="rounded-xl border border-border/60 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(item.status)}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      마지막 수정: {formatDateTime(item.updated_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{item.summary}</p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/feedback/${item.id}`}>상세 보기</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

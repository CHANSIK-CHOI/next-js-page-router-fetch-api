import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { PLACEHOLDER_SRC } from "@/constants";
import { formatDateTime, ratingStars } from "@/util";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getDetailFeedbacksApi } from "@/lib/feedback.server";
import type { FeedbackRow, SupabaseError, UserRole } from "@/types";
import { getSupabaseServerByAccessToken } from "@/lib/supabase.server";

const HOME_REDIRECT = { redirect: { destination: "/", permanent: false } } as const;

type ViewerAccess = {
  userId: string | null;
  isAuthor: boolean;
  role: UserRole["role"] | null;
  isAdmin: boolean;
};

const getViewerAccess = async (
  context: GetServerSidePropsContext,
  authorId: string
): Promise<ViewerAccess> => {
  const fallback: ViewerAccess = {
    userId: null,
    isAuthor: false,
    role: null,
    isAdmin: false,
  };

  const accessToken = context.req.cookies["sb-access-token"];
  if (!accessToken) return fallback;

  const supabaseServer = getSupabaseServerByAccessToken(accessToken);
  if (!supabaseServer) return fallback;

  const { data: authData, error: authError } = await supabaseServer.auth.getUser();
  if (authError || !authData.user) return fallback;

  const userId = authData.user.id;
  const isAuthor = userId === authorId;

  const {
    data: roleData,
    error: roleError,
  }: { data: Pick<UserRole, "role"> | null; error: SupabaseError } = await supabaseServer
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const role = roleError ? null : (roleData?.role ?? null);

  return {
    userId,
    isAuthor,
    role,
    isAdmin: role === "admin",
  };
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const id = context.params?.id;
  if (typeof id !== "string") {
    return { notFound: true };
  }

  try {
    const detailFeedbacksData: FeedbackRow | null = await getDetailFeedbacksApi(id);
    if (!detailFeedbacksData) {
      return { notFound: true };
    }

    const viewer = await getViewerAccess(context, detailFeedbacksData.author_id);

    // approved가 아니면 작성자/관리자만 접근 허용
    if (detailFeedbacksData.status !== "approved" && !viewer.isAuthor && !viewer.isAdmin) {
      return HOME_REDIRECT;
    }

    return {
      props: { detailFeedbacksData, viewer },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
};

export default function FeedbackDetailPage({
  detailFeedbacksData,
  viewer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              피드백 상세
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {detailFeedbacksData.summary}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">ID: {detailFeedbacksData.id}</p>
              {viewer.isAuthor && (
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  작성자
                </span>
              )}
              {viewer.role && (
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  role: {viewer.role}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback">목록으로</Link>
            </Button>
            {viewer.isAuthor && <Button type="button">수정 요청</Button>}
            {viewer.isAdmin &&
              (detailFeedbacksData.status === "pending" ||
                detailFeedbacksData.status === "revised_pending") && (
                <Button type="button">승인하기</Button>
              )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            승인됨
          </span>
          <span className="text-sm font-semibold text-amber-500">
            {ratingStars(detailFeedbacksData.rating)}
          </span>
          <span className="text-xs text-muted-foreground">
            수정 {detailFeedbacksData.revision_count}회
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
              <Image
                src={detailFeedbacksData.avatar_url || PLACEHOLDER_SRC}
                alt={`${detailFeedbacksData.display_name} avatar`}
                width={48}
                height={48}
                unoptimized={!detailFeedbacksData.avatar_url}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-base font-semibold text-foreground">
              {detailFeedbacksData.display_name}
            </span>
            {detailFeedbacksData.is_company_public && detailFeedbacksData.company_name && (
              <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
                {detailFeedbacksData.company_name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detailFeedbacksData.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-white/70 p-4 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              등록일
            </p>
            <p className="mt-2 text-base text-foreground">
              {formatDateTime(detailFeedbacksData.created_at)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/70 p-4 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              승인일
            </p>
            <p className="mt-2 text-base text-foreground">
              {detailFeedbacksData.reviewed_at
                ? formatDateTime(detailFeedbacksData.reviewed_at)
                : "승인 전"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">강점</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detailFeedbacksData.strengths}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">질문</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detailFeedbacksData.questions}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">개선 제안</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detailFeedbacksData.suggestions}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">승인 정보</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            승인 담당자: <span className="text-foreground">{detailFeedbacksData.reviewed_by}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            마지막 수정:{" "}
            <span className="text-foreground">
              {formatDateTime(detailFeedbacksData.updated_at)}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

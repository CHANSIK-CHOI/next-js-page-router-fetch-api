import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { PLACEHOLDER_SRC } from "@/constants";

const feedbackItems = [
  {
    id: "fb-101",
    displayName: "Jamie",
    companyName: "Nexa Labs",
    isCompanyPublic: true,
    avatarUrl: "https://placehold.co/80x80?text=J",
    summary: "구성력이 탄탄하고, 문제 정의가 명확했어요.",
    rating: 5,
    status: "approved",
    tags: ["Frontend", "UX", "Clarity"],
    createdAt: "2026-02-02",
    updatedAt: "2026-02-02",
    isPublic: true,
    revisionCount: 0,
  },
  {
    id: "fb-102",
    displayName: "S.Kim",
    companyName: "",
    isCompanyPublic: false,
    avatarUrl: "",
    summary: "기획 의도와 구현 범위를 잘 설명했어요.",
    rating: 4,
    status: "pending",
    tags: ["Communication", "Planning"],
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
    isPublic: false,
    revisionCount: 0,
  },
  {
    id: "fb-103",
    displayName: "Min",
    companyName: "Studio Amp",
    isCompanyPublic: true,
    avatarUrl: "https://placehold.co/80x80?text=M",
    summary: "디자인과 개발 사이의 균형이 좋았습니다.",
    rating: 5,
    status: "revised_pending",
    tags: ["UI", "Detail", "Balance"],
    createdAt: "2026-02-06",
    updatedAt: "2026-02-07",
    isPublic: true,
    revisionCount: 1,
  },
  {
    id: "fb-104",
    displayName: "Anonymous",
    companyName: "",
    isCompanyPublic: false,
    avatarUrl: "",
    summary: "코드 품질이 안정적이고 설명이 깔끔했습니다.",
    rating: 4,
    status: "approved",
    tags: ["Code", "Reliability"],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
    isPublic: true,
    revisionCount: 0,
  },
];

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

export default function FeedbackBoardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">인터뷰어 피드백 보드</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              승인된 피드백은 공개 보드에 노출되고, 승인 대기 중인 피드백은 상태 배지가
              표시됩니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback/new">피드백 남기기</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/feedback">관리자 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">전체</p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">{feedbackItems.length}</strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">승인됨</p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {feedbackItems.filter((item) => item.status === "approved").length}
          </strong>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">승인 대기</p>
          <strong className="mt-2 block text-2xl font-semibold text-foreground">
            {feedbackItems.filter((item) => item.status !== "approved").length}
          </strong>
        </div>
      </section>

      <section className="grid gap-4">
        {feedbackItems.map((item) => (
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
                <span className="text-xs text-muted-foreground">
                  {item.createdAt} 등록
                </span>
              </div>
              <span className="text-sm font-semibold text-amber-500">
                {renderStars(item.rating)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
                  <Image
                    src={item.avatarUrl || PLACEHOLDER_SRC}
                    alt={`${item.displayName} avatar`}
                    width={40}
                    height={40}
                    unoptimized={!item.avatarUrl}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-base font-semibold text-foreground">
                  {item.displayName}
                </span>
                {item.isCompanyPublic && item.companyName && (
                  <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
                    {item.companyName}
                  </span>
                )}
                <span className="text-xs">수정 {item.revisionCount}회</span>
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
              <span className="text-xs text-muted-foreground">
                마지막 수정 {item.updatedAt}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

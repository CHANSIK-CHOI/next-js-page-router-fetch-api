import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "@/components/ui";
import { PLACEHOLDER_SRC } from "@/constants";

const mockDetail = {
  id: "fb-101",
  displayName: "Jamie",
  companyName: "Nexa Labs",
  isCompanyPublic: true,
  avatarUrl: "https://placehold.co/120x120?text=J",
  summary: "구성력이 탄탄하고, 문제 정의가 명확했어요.",
  strengths: "요구사항을 빠르게 구조화하고, UI를 일관되게 구성합니다.",
  questions: "권한 정책을 어떻게 확장할 계획인지 궁금합니다.",
  suggestions: "필터링 UX에 짧은 도움말이 있으면 좋겠습니다.",
  rating: 5,
  status: "approved",
  tags: ["Frontend", "UX", "Clarity"],
  createdAt: "2026-02-02",
  updatedAt: "2026-02-02",
  reviewedAt: "2026-02-03",
  reviewedBy: "Admin",
  revisionCount: 0,
};

const renderStars = (rating: number) => {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(rating);
};

export default function FeedbackDetailPage() {
  const router = useRouter();
  const detail = mockDetail;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              피드백 상세
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {detail.summary}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">ID: {router.query.id}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback">목록으로</Link>
            </Button>
            <Button type="button">수정 요청</Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            승인됨
          </span>
          <span className="text-sm font-semibold text-amber-500">
            {renderStars(detail.rating)}
          </span>
          <span className="text-xs text-muted-foreground">수정 {detail.revisionCount}회</span>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
              <Image
                src={detail.avatarUrl || PLACEHOLDER_SRC}
                alt={`${detail.displayName} avatar`}
                width={48}
                height={48}
                unoptimized={!detail.avatarUrl}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-base font-semibold text-foreground">
              {detail.displayName}
            </span>
            {detail.isCompanyPublic && detail.companyName && (
              <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
                {detail.companyName}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.tags.map((tag) => (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">등록일</p>
            <p className="mt-2 text-base text-foreground">{detail.createdAt}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/70 p-4 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">승인일</p>
            <p className="mt-2 text-base text-foreground">{detail.reviewedAt}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">강점</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detail.strengths}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">질문</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detail.questions}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">개선 제안</h3>
          <p className="mt-3 text-sm text-muted-foreground">{detail.suggestions}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">승인 정보</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            승인 담당자: <span className="text-foreground">{detail.reviewedBy}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            마지막 수정: <span className="text-foreground">{detail.updatedAt}</span>
          </p>
        </div>
      </section>
    </div>
  );
}

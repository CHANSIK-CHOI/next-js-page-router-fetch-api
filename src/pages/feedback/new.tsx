import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

const tagOptions = ["Frontend", "Communication", "Problem Solving", "UX", "Speed", "Ownership"];

export default function FeedbackNewPage() {
  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">피드백 작성</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              작성 후에는 승인 대기 상태로 등록되며, 승인된 피드백만 공개됩니다.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/feedback">목록으로</Link>
          </Button>
        </div>
      </section>

      <form className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">프로필</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-[140px_1fr] md:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted text-sm text-muted-foreground">
                Avatar
              </div>
              <div className="flex w-full flex-col gap-2">
                <Button type="button" variant="outline" size="sm" className="w-full">
                  프로필 업로드
                </Button>
                <Button type="button" variant="ghost" size="sm" className="w-full">
                  프로필 삭제
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  JPG/PNG, 2MB 이하
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                표시 이름
                <input type="text" placeholder="예: Jamie" className={inputBase} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                회사명
                <input type="text" placeholder="선택" className={inputBase} />
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-primary" />
                회사명 공개
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">평점</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            1점(개선 필요) ~ 5점(매우 우수)
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                {value}점
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">피드백 상세</h3>
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              한줄평
              <input type="text" placeholder="짧은 요약을 작성해주세요" className={inputBase} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              강점
              <textarea
                placeholder="좋았던 점을 구체적으로 적어주세요"
                rows={3}
                className={inputBase}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              질문/궁금한 점
              <textarea
                placeholder="추가로 궁금한 부분이 있나요?"
                rows={3}
                className={inputBase}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              개선 제안
              <textarea
                placeholder="개선하면 좋을 점이 있나요?"
                rows={3}
                className={inputBase}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">키워드 선택</h3>
          <p className="mt-1 text-sm text-muted-foreground">해당되는 키워드를 골라주세요.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-border/60 px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              제출 후에는 승인 대기 상태로 등록됩니다.
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/feedback">취소</Link>
              </Button>
              <Button type="button">제출하기</Button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

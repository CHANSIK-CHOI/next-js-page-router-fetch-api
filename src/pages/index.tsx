import Link from "next/link";
import { Button } from "@/components/ui";
import { useSession } from "@/components/useSession";
import { getUserName } from "@/util";

export default function MainPage() {
  const { session, isAdminUi, isRoleLoading } = useSession();
  const roleLabel = isRoleLoading ? "확인 중..." : isAdminUi ? "admin" : "reviewer";
  const userName = getUserName(session?.user);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-border/60 bg-background/80 p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Portfolio Home
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          인터뷰어 피드백 보드
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          이 프로젝트의 메인 화면은 <span className="font-semibold text-foreground">/feedback</span>
          입니다. 작성, 검토, 공개까지 이어지는 권한 기반 피드백 흐름을 구현했습니다.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/feedback">피드백 보드 바로가기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/feedback/new">피드백 작성하기</Link>
          </Button>
          {!session && (
            <Button asChild variant="outline">
              <Link href="/login">로그인</Link>
            </Button>
          )}
          {!isRoleLoading && isAdminUi && (
            <Button asChild variant="outline">
              <Link href="/admin/feedback">관리자 검토 큐</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current User
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{userName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {session ? "인증 완료" : "비로그인 상태"}
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Permission Model
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{roleLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            역할 기반으로 관리자 UI와 개인 데이터 노출이 분기됩니다.
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Board Route
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">/feedback</p>
          <p className="mt-1 text-sm text-muted-foreground">
            공개 글 + 수정 대기 preview + 본인 full 데이터를 병합해서 표시합니다.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <h3 className="text-lg font-semibold text-foreground">작동 흐름</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/70 p-4 dark:border-white/10 dark:bg-neutral-900/60">
            <p className="text-sm font-semibold text-foreground">1. 작성</p>
            <p className="mt-1 text-xs text-muted-foreground">
              인터뷰어가 피드백을 작성하고 제출합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/70 p-4 dark:border-white/10 dark:bg-neutral-900/60">
            <p className="text-sm font-semibold text-foreground">2. 검토</p>
            <p className="mt-1 text-xs text-muted-foreground">
              관리자가 승인/반려를 처리하고 공개 여부를 결정합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/70 p-4 dark:border-white/10 dark:bg-neutral-900/60">
            <p className="text-sm font-semibold text-foreground">3. 공개</p>
            <p className="mt-1 text-xs text-muted-foreground">
              승인된 글은 보드에 공개되고, 수정 대기는 preview로 보여집니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

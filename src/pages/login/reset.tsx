import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function PasswordResetPage() {
  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

  return (
    <div className="mx-auto w-full max-w-xl">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-7 shadow-lg dark:border-white/10 dark:bg-neutral-900/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,160,160,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(120,120,120,0.12),transparent_70%)]"
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-foreground">
            Reset
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">비밀번호 재설정</h3>
          <p className="mt-2 text-sm text-muted-foreground">새 비밀번호를 입력하세요.</p>
        </div>

        <form className="relative z-10 mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="reset_password">
              새 비밀번호
            </label>
            <input
              id="reset_password"
              className={inputBase}
              type="password"
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button type="submit">비밀번호 변경</Button>
          </div>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          로그인 화면으로 돌아가기{" "}
          <Link href="/login" className="font-semibold text-primary">
            로그인
          </Link>
        </div>
      </section>
    </div>
  );
}

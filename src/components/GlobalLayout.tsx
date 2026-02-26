import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthActions from "./AuthActions";
import { Switch } from "@/components/ui";
import { useTheme } from "next-themes";

type StackBadge = {
  label: string;
  iconSrc?: string;
  invertOnDark?: boolean;
};

const CORE_STACK_BADGES: StackBadge[] = [
  { label: "Next.js Page Router", iconSrc: "/icons/nextjs.svg", invertOnDark: true },
  { label: "Supabase", iconSrc: "/icons/supabase.svg" },
  { label: "TypeScript" },
  { label: "shadcn/ui" },
  { label: "Tailwind CSS" },
];

const DELIVERY_BADGES: StackBadge[] = [
  { label: "Vercel", iconSrc: "/icons/vercel.svg", invertOnDark: true },
  { label: "GitHub", iconSrc: "/icons/github.svg", invertOnDark: true },
];

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const [isThemeMounted, setIsThemeMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setIsThemeMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_12%,rgba(160,160,160,0.18),transparent_55%),radial-gradient(circle_at_92%_12%,rgba(120,120,120,0.16),transparent_60%),radial-gradient(circle_at_20%_80%,rgba(90,90,90,0.12),transparent_60%),linear-gradient(160deg,rgba(255,255,255,0.85),rgba(235,235,235,0.95))] dark:bg-[radial-gradient(circle_at_12%_16%,rgba(160,160,160,0.12),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(120,120,120,0.12),transparent_60%),radial-gradient(circle_at_20%_80%,rgba(90,90,90,0.1),transparent_60%),linear-gradient(160deg,rgba(10,10,10,0.98),rgba(24,24,24,0.98))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(160,160,160,0.2),transparent_70%)] opacity-70 dark:bg-[radial-gradient(circle,rgba(160,160,160,0.14),transparent_70%)] dark:opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-44 -left-36 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(120,120,120,0.18),transparent_70%)] opacity-70 dark:bg-[radial-gradient(circle,rgba(120,120,120,0.12),transparent_70%)] dark:opacity-40"
      />

      <header className="border-b border-border/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70"
          >
            <Image
              aria-hidden
              src="/icons/home.svg"
              alt="Home icon"
              width={16}
              height={16}
              className="dark:invert"
            />
            <span className="text-base tracking-tight sm:text-lg">홈으로 가기</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
              <span>Dark</span>
              <Switch
                checked={isThemeMounted ? isDarkMode : false}
                disabled={!isThemeMounted}
                aria-label="다크 모드 전환"
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            <AuthActions />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-12 pt-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <section className="relative grid gap-6 overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(235,235,235,0.96))] p-6 shadow-lg dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(12,12,12,0.95),rgba(24,24,24,0.95))] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 -top-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(160,160,160,0.16),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(160,160,160,0.12),transparent_70%)]"
            />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-foreground">
                Project Specs
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Next.js + Supabase로 만든
                <br />
                권한 기반 피드백 보드
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Auth, RLS, CRUD, 승인 워크플로우를 중심으로 구성했습니다.
              </p>
            </div>
            <aside className="relative z-10 grid gap-3">
              <div className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Core Stack
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CORE_STACK_BADGES.map((stack) => (
                    <span
                      key={stack.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/10 dark:bg-neutral-800/70"
                    >
                      {stack.iconSrc && (
                        <Image
                          src={stack.iconSrc}
                          alt={`${stack.label} icon`}
                          width={12}
                          height={12}
                          className={stack.invertOnDark ? "dark:invert" : undefined}
                        />
                      )}
                      {stack.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Delivery
                </span>
                <strong className="mt-2 block text-lg font-semibold text-foreground">
                  Vercel 배포 · GitHub 형상관리
                </strong>
                <span className="mt-1 block text-sm text-muted-foreground">
                  환경변수 기반 구성, API Route 기반 백엔드, 역할 분리 정책을 적용했습니다.
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DELIVERY_BADGES.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/10 dark:bg-neutral-800/70"
                    >
                      {item.iconSrc && (
                        <Image
                          src={item.iconSrc}
                          alt={`${item.label} icon`}
                          width={12}
                          height={12}
                          className={item.invertOnDark ? "dark:invert" : undefined}
                        />
                      )}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="grid gap-6">
            <div className="flex flex-col gap-5">{children}</div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-6 py-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/CHANSIK-CHOI/next-js-page-router-fetch-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-foreground"
          >
            <Image
              src="/icons/github.svg"
              alt="GitHub icon"
              width={16}
              height={16}
              className="dark:invert"
            />
            GitHub
          </a>
          <a
            href="https://velog.io/@ckstlr0828/posts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-foreground"
          >
            <Image
              src="/icons/velog.svg"
              alt="Velog icon"
              width={16}
              height={16}
              className="dark:invert"
            />
            Velog
          </a>
        </div>
      </footer>
    </div>
  );
}

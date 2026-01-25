import React, { ReactNode } from "react";
import classNames from "classnames/bind";
import Image from "next/image";
import Link from "next/link";
import styles from "./global-layout.module.scss";
import AuthActions from "./AuthActions";
const cx = classNames.bind(styles);

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cx("wrap")}>
      <header className={cx("header")}>
        <div className={cx("headerInner")}>
          <Link href={"/"} className={cx("homeLink")}>
            <Image aria-hidden src="/icons/home.svg" alt="Home icon" width={16} height={16} />
            <span className={cx("homeTitle")}>홈으로 가기</span>
          </Link>
          <AuthActions />
        </div>
      </header>
      <main className={cx("main")}>
        <div className={cx("mainInner")}>
          <section className={cx("hero")}>
            <div className={cx("heroGlow")} />
            <div className={cx("heroContent")}>
              <span className={cx("heroKicker")}>Next.js · Supabase</span>
              <h1>Next.js & Supabase 를 활용한 Auth & CRUD 프로젝트</h1>
              <p className={cx("heroSubtitle")}>
                지금까지 배운 Next.js & Supabase를 활용해 사용자 데이터를 관리하고 CRUD를
                구현합니다.
              </p>
            </div>
            <aside className={cx("heroSide")}>
              <div className={cx("statCard")}>
                <span className={cx("statLabel")}>스택</span>
                <strong className={cx("statValue")}>Next.js {`(Page Router)`} + Supabase</strong>
                <span className={cx("statMeta")}>Database · Storage · Auth · Webhooks</span>
              </div>
            </aside>
          </section>
          <section className={cx("layoutGrid")}>
            <div className={cx("content")}>{children}</div>
          </section>
        </div>
      </main>
      <footer className={cx("footer")}>
        <a
          href="https://github.com/CHANSIK-CHOI/next-js-page-router-fetch-api"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/icons/github.svg" alt="GitHub icon" width={16} height={16} />
          GitHub
        </a>
        <a href="https://velog.io/@ckstlr0828/posts" target="_blank" rel="noopener noreferrer">
          <Image src="/icons/velog.svg" alt="Velog icon" width={16} height={16} />
          Velog
        </a>
      </footer>
    </div>
  );
}

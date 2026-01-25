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
            <span className={cx("homeTitle")}>User CRUD Lab</span>
            <span className={cx("homeBadge")}>Page Router</span>
          </Link>
          <AuthActions />
        </div>
      </header>
      <main className={cx("main")}>
        <div className={cx("mainInner")}>
          <section className={cx("hero")}>
            <div className={cx("heroGlow")} />
            <div className={cx("heroContent")}>
              <span className={cx("heroKicker")}>Next.js · Fetch API · Supabase</span>
              <h1>Next.js{`(Page Router)`}에서 Fetch API 실습</h1>
              <p className={cx("heroSubtitle")}>
                지금까지 배운 JavaScript & TypeScript를 활용해 사용자 데이터를 관리하고 CRUD를 구현합니다.
              </p>
              <div className={cx("heroTags")}>
                <span>Static Props</span>
                <span>Revalidate</span>
                <span>Supabase Storage</span>
              </div>
            </div>
          </section>
          <section className={cx("content")}>{children}</section>
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

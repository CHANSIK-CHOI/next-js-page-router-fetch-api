import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { FeedbackPrivateRow } from "@/types";
import {
  formatDateTime,
  isSvgImageSrc,
  normalizeExternalImageSrc,
  ratingStars,
  statusBadge,
  statusLabel,
} from "@/util";
import { PLACEHOLDER_SRC } from "@/constants";

type AdminFeedbackBoxProps = {
  data: FeedbackPrivateRow;
};
export default function AdminFeedbackBox({ data }: AdminFeedbackBoxProps) {
  const avatarSrc = normalizeExternalImageSrc(data.avatar_url || PLACEHOLDER_SRC);

  return (
    <article className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(data.status)}`}
          >
            {statusLabel(data.status)}
          </span>
          <span className="text-xs text-muted-foreground">
            {data.created_at !== data.updated_at && data.revision_count > 0
              ? "마지막 수정"
              : "등록"}{" "}
            : {formatDateTime(data.updated_at)}
          </span>
        </div>
        <span className="text-sm font-semibold text-amber-500">{ratingStars(data.rating)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted">
            <Image
              src={avatarSrc}
              alt={`${data.display_name} avatar`}
              width={40}
              height={40}
              unoptimized={isSvgImageSrc(avatarSrc)}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-base font-semibold text-foreground">{data.display_name}</span>
          {data.is_company_public && data.company_name && (
            <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs">
              {data.company_name}
            </span>
          )}
          <span className="text-xs">수정 {data.revision_count}회</span>
        </div>
        <p className="text-sm text-muted-foreground">작성자 이메일: {data.email}</p>
        <p className="text-base text-foreground">{data.summary}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/feedback/${data.id}`}>상세 보기</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm">
            비공개
          </Button>
          {(data.status === "pending" || data.status === "revised_pending") && (
            <>
              <Button type="button" variant="outline" size="sm">
                반려
              </Button>
              <Button type="button" size="sm">
                승인
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

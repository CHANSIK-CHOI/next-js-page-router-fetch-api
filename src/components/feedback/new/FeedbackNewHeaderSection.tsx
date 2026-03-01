import Link from "next/link";
import { Button } from "@/components/ui";

type FeedbackNewHeaderSectionProps = {
  isSubmitting: boolean;
};

export default function FeedbackNewHeaderSection({ isSubmitting }: FeedbackNewHeaderSectionProps) {
  return (
    <section className="sticky top-0 z-30 rounded-2xl border border-border/60 bg-background p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">피드백 작성</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            작성 후에는 승인 대기 상태로 등록되며, 승인된 피드백만 공개됩니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/feedback">목록으로</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            제출하기
          </Button>
        </div>
      </div>
    </section>
  );
}

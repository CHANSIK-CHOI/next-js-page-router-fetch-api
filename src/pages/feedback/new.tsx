import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { useSession } from "@/components";
import { Button } from "@/components/ui";
import {
  chipButtonBaseStyle,
  inputBaseStyle,
  NEW_FEEDBACK_DEFAULT_VALUES,
  TAG_OPTIONS,
} from "@/constants";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatar/constants";
import { getAvatarUrl } from "@/lib/avatar/profile";
import { checkAvatarApiSrcPrivate } from "@/lib/avatar/path";
import { cn } from "@/lib/utils";
import { getUserCompany, getUserName } from "@/util";
import { FeedbackNewFormValues } from "@/types";

export default function FeedbackNewPage() {
  const { session } = useSession();
  const user = session?.user;

  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackNewFormValues>({
    mode: "onSubmit",
    defaultValues: NEW_FEEDBACK_DEFAULT_VALUES,
  });

  const sessionUserName = getUserName(user);
  const sessionAvatar = getAvatarUrl(user);
  const { sessionCompanyName, sessionIsCompanyPublic } = getUserCompany(user);

  useEffect(() => {
    reset(
      {
        ...getValues(),
        display_name: sessionUserName,
        avatar: sessionAvatar,
        is_company_public: sessionIsCompanyPublic,
        company_name: sessionCompanyName,
      },
      { keepDirtyValues: true }
    );
  }, [
    getValues,
    reset,
    sessionUserName,
    sessionAvatar,
    sessionCompanyName,
    sessionIsCompanyPublic,
  ]);

  const avatarValue = useWatch({ control, name: "avatar" });
  const isCompanyPublic = useWatch({
    control,
    name: "is_company_public",
  });
  const ratingValue = useWatch({ control, name: "rating" });
  const tagsValue = useWatch({ control, name: "tags" });

  const avatarSrc = avatarValue || sessionAvatar || AVATAR_PLACEHOLDER_SRC;
  const isPlaceholderAvatar = avatarSrc === AVATAR_PLACEHOLDER_SRC;

  const onSubmit = (values: FeedbackNewFormValues) => {
    console.log(values);
  };

  /*
    shouldDirty: true
    해당 필드를 “사용자가 수정함(dirty)”으로 표시합니다.
    즉 formState.isDirty, dirtyFields가 업데이트됩니다.
  */

  /*
    shouldValidate: true
    값 변경 직후 그 필드(및 관련 폼) 검증을 다시 실행합니다.
    에러 메시지 갱신에 필요합니다.
  */

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
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
        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">프로필</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-[140px_1fr] md:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted text-sm text-muted-foreground">
                <Image
                  className="h-full w-full object-cover"
                  src={avatarSrc}
                  alt={`유저 프로필`}
                  width={120}
                  height={120}
                  unoptimized={avatarSrc.startsWith("data:") || checkAvatarApiSrcPrivate(avatarSrc)}
                />
              </div>
              <input type="hidden" {...register("avatar")} />
              <p className="text-center text-xs text-muted-foreground">
                {isPlaceholderAvatar
                  ? "등록된 프로필 이미지가 없어 기본 이미지가 사용됩니다."
                  : "마이페이지에 등록된 프로필 이미지를 사용합니다."}
              </p>
            </div>
            <div className="grid gap-6">
              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                이름
                <input
                  type="text"
                  placeholder="예: Jamie"
                  readOnly
                  className={inputBaseStyle}
                  {...register("display_name")}
                />
                <p className="text-xs text-muted-foreground">
                  회원가입 시 이름을 입력하지 않으면, 이메일의 @ 앞부분이 이름으로 표시됩니다.
                </p>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
                회사명
                <input
                  type="text"
                  placeholder="회사명을 입력해주세요."
                  className={inputBaseStyle}
                  disabled={!isCompanyPublic}
                  {...register("company_name", {
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                    validate: (v) =>
                      !isCompanyPublic ||
                      (typeof v === "string" && v.trim().length > 0) ||
                      "회사명을 입력해주세요",
                  })}
                />
                {errors.company_name ? (
                  <p className="text-xs text-destructive">{errors.company_name?.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    회사명을 공개하려면 ‘회사명 공개’ 체크박스를 선택해주세요.
                  </p>
                )}
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  {...register("is_company_public", {
                    onChange: (e) => {
                      const checked = e.target.checked;
                      if (!checked) {
                        clearErrors("company_name");
                      } else {
                        void trigger("company_name");
                      }
                    },
                  })}
                />
                회사명 공개
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">평점</h3>
          <p className="mt-1 text-sm text-muted-foreground">1점(개선 필요) ~ 5점(매우 우수)</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                htmlFor={`chipValue_${value}`}
                className={cn(chipButtonBaseStyle, {
                  "border-primary bg-primary/10 text-primary": value === Number(ratingValue),
                })}
              >
                <input
                  id={`chipValue_${value}`}
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register("rating", {
                    setValueAs: (v) => Number(v),
                    validate: (v) => v > 0 || "평점을 선택해주세요.",
                  })}
                />
                {value}점
              </label>
            ))}
          </div>
          {errors.rating && (
            <p className="mt-2 text-xs text-destructive">{errors.rating.message}</p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">피드백 상세</h3>
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              한줄평
              <input
                type="text"
                placeholder="짧은 요약을 작성해주세요"
                className={inputBaseStyle}
                {...register("summary", {
                  required: "한줄평을 입력해주세요.",
                  setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                })}
              />
              {errors.summary && (
                <span className="text-xs text-destructive">{errors.summary.message}</span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              강점
              <textarea
                placeholder="좋았던 점을 구체적으로 적어주세요"
                rows={3}
                className={inputBaseStyle}
                {...register("strengths", {
                  setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                })}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              질문/궁금한 점
              <textarea
                placeholder="추가로 궁금한 부분이 있나요?"
                rows={3}
                className={inputBaseStyle}
                {...register("questions", {
                  setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                })}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
              개선 제안
              <textarea
                placeholder="개선하면 좋을 점이 있나요?"
                rows={3}
                className={inputBaseStyle}
                {...register("suggestions", {
                  setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                })}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          <h3 className="text-lg font-semibold text-foreground">키워드 선택</h3>
          <p className="mt-1 text-sm text-muted-foreground">해당되는 키워드를 골라주세요.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const isSelected = tagsValue.includes(tag);
              return (
                <label
                  key={tag}
                  htmlFor={`tag_${tag}`}
                  className={cn(chipButtonBaseStyle, "text-xs", {
                    "border-primary bg-primary/10 text-primary": isSelected,
                  })}
                >
                  <input
                    id={`tag_${tag}`}
                    type="checkbox"
                    value={tag}
                    className="sr-only"
                    {...register("tags", {
                      validate: (v) => (v?.length ?? 0) > 0 || "키워드를 1개 이상 선택해주세요.",
                    })}
                  />
                  # {tag}
                </label>
              );
            })}
          </div>
          {errors.tags && <p className="mt-2 text-xs text-destructive">{errors.tags.message}</p>}
        </section>
      </form>
    </div>
  );
}

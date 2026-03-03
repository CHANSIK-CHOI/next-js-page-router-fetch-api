import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/components/session";
import { NEW_FEEDBACK_DEFAULT_VALUES } from "@/constants";
import { getUserCompany, getUserName, getAvatarUrl } from "@/lib/user/profile";
import type { FeedbackNewFormValues } from "@/types";
import {
  FeedbackNewHeaderSection,
  FeedbackNewProfileSection,
  FeedbackNewRatingSection,
  FeedbackNewDetailSection,
  FeedbackNewTagsSection,
} from "@/components/feedback";
import { useAlert } from "@/components/ui";
import { replaceSafely } from "@/lib/navigation/client";
import { useRouter } from "next/router";

export const newFeedbackErrorMsg = {
  nameSummary: "이름과 한줄평은 필수 입력 항목입니다.",
  rating: "평점은 1점부터 5점 사이로 선택해주세요.",
  tag: "키워드를 1개 이상 선택해주세요.",
  company: "회사명을 공개하려면 회사명을 입력해주세요.",
  email: "사용자 이메일을 확인할 수 없습니다.",
};

const DEFAULT_NEW_FEEDBACK_ERROR_DESCRIPTION =
  "피드백 등록에 실패했습니다.\n잠시 후 다시 시도해주세요.";
const newFeedbackErrorMessages = new Set(Object.values(newFeedbackErrorMsg));

export default function FeedbackNewPage() {
  const { session } = useSession();
  const { openAlert } = useAlert();
  const user = session?.user;
  const router = useRouter();

  const formMethods = useForm<FeedbackNewFormValues>({
    mode: "onSubmit",
    defaultValues: NEW_FEEDBACK_DEFAULT_VALUES,
  });
  const {
    reset,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

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
    reset,
    getValues,
    sessionUserName,
    sessionAvatar,
    sessionCompanyName,
    sessionIsCompanyPublic,
  ]);

  const onSubmit = async (values: FeedbackNewFormValues) => {
    if (!session?.access_token) {
      openAlert({
        description: "로그인이 필요합니다.",
        onOk: () => {
          void replaceSafely(router, "/login?next=/feedback/new");
        },
      });
      return;
    }

    try {
      const response = await fetch("/api/feedbacks/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      });

      const result: { data: { id: string } | null; error: string | null } = await response
        .json()
        .catch(() => ({ data: null, error: "Invalid response" }));

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "피드백 등록 실패");
      }

      openAlert({
        description: "피드백이 등록되었습니다.\n관리자 승인 후 전체 공개됩니다.",
        onOk: () => {
          void replaceSafely(router, "/feedback");
        },
      });
    } catch (error) {
      console.error(error);
      const description =
        error instanceof Error && newFeedbackErrorMessages.has(error.message)
          ? error.message
          : DEFAULT_NEW_FEEDBACK_ERROR_DESCRIPTION;
      openAlert({
        description,
      });
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col gap-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <FeedbackNewHeaderSection isSubmitting={isSubmitting} />
          <FeedbackNewProfileSection sessionAvatar={sessionAvatar} />
          <FeedbackNewRatingSection />
          <FeedbackNewDetailSection />
          <FeedbackNewTagsSection />
        </form>
      </div>
    </FormProvider>
  );
}

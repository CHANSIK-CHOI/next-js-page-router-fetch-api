import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSession } from "@/components";
import { NEW_FEEDBACK_DEFAULT_VALUES } from "@/constants";
import { getAvatarUrl } from "@/lib/avatar/profile";
import { getUserCompany, getUserName } from "@/lib/user/profile";
import type { FeedbackNewFormValues } from "@/types";
import FeedbackNewHeaderSection from "@/components/feedback/new/FeedbackNewHeaderSection";
import FeedbackNewProfileSection from "@/components/feedback/new/FeedbackNewProfileSection";
import FeedbackNewRatingSection from "@/components/feedback/new/FeedbackNewRatingSection";
import FeedbackNewDetailSection from "@/components/feedback/new/FeedbackNewDetailSection";
import FeedbackNewTagsSection from "@/components/feedback/new/FeedbackNewTagsSection";

export default function FeedbackNewPage() {
  const { session } = useSession();
  const user = session?.user;

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

  const onSubmit = (values: FeedbackNewFormValues) => {
    console.log(values);
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

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

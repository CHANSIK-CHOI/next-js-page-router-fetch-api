import type React from "react";
import { useFormContext } from "react-hook-form";
import type { MyProfileForm } from "@/types/forms";
import MyProfileAvatarPanel from "./MyProfileAvatarPanel";
import MyProfileFormFields from "./MyProfileFormFields";

type MyProfileEditorSectionProps = {
  viewModel: {
    sessionAvatar: string;
    sessionUserName: string;
    userEmail: string;
    providers: string[];
    isUploadingAvatar: boolean;
  };
  actions: {
    onChangeImage: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    onRemoveImage: () => void;
    onResetImage: () => void;
    onSubmit: (values: MyProfileForm) => Promise<void>;
  };
};

export default function MyProfileEditorSection({
  viewModel,
  actions,
}: MyProfileEditorSectionProps) {
  const { handleSubmit } = useFormContext<MyProfileForm>();

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-7 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
      <MyProfileAvatarPanel
        sessionAvatar={viewModel.sessionAvatar}
        sessionUserName={viewModel.sessionUserName}
        userEmail={viewModel.userEmail}
        providers={viewModel.providers}
        isUploadingAvatar={viewModel.isUploadingAvatar}
        onChangeImage={actions.onChangeImage}
        onRemoveImage={actions.onRemoveImage}
        onResetImage={actions.onResetImage}
      />

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(actions.onSubmit)}>
        <MyProfileFormFields
          userEmail={viewModel.userEmail}
          isUploadingAvatar={viewModel.isUploadingAvatar}
        />
      </form>
    </section>
  );
}

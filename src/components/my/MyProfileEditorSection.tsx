import type React from "react";
import { useFormContext } from "react-hook-form";
import type { MyProfileForm } from "@/types";
import MyProfileAvatarPanel from "@/components/my/MyProfileAvatarPanel";
import MyProfileFormFields from "@/components/my/MyProfileFormFields";

type MyProfileEditorSectionProps = {
  sessionAvatar: string;
  sessionUserName: string;
  userEmail: string;
  providers: string[];
  isUploadingAvatar: boolean;
  onChangeImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onResetImage: () => void;
  onSubmit: (values: MyProfileForm) => Promise<void>;
};

export default function MyProfileEditorSection({
  sessionAvatar,
  sessionUserName,
  userEmail,
  providers,
  isUploadingAvatar,
  onChangeImage,
  onRemoveImage,
  onResetImage,
  onSubmit,
}: MyProfileEditorSectionProps) {
  const { handleSubmit } = useFormContext<MyProfileForm>();

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-7 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
      <MyProfileAvatarPanel
        sessionAvatar={sessionAvatar}
        sessionUserName={sessionUserName}
        userEmail={userEmail}
        providers={providers}
        isUploadingAvatar={isUploadingAvatar}
        onChangeImage={onChangeImage}
        onRemoveImage={onRemoveImage}
        onResetImage={onResetImage}
      />

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <MyProfileFormFields userEmail={userEmail} isUploadingAvatar={isUploadingAvatar} />
      </form>
    </section>
  );
}

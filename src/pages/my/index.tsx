import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "@/components";
import { useAlert } from "@/components/ui";
import { replaceSafely } from "@/lib/navigation/client";
import { uploadAvatarToSupabase, validateAvatarFile } from "@/lib/avatar/client";
import { AVATAR_PLACEHOLDER_SRC } from "@/constants";
import { getAvatarUrl } from "@/lib/avatar/profile";
import { getAuthProviders } from "@/lib/auth/provider";
import { getUserCompany, getUserName } from "@/lib/user/profile";
import type { MyProfileForm } from "@/types";
import MyPageHeaderSection from "@/components/my/MyPageHeaderSection";
import MyProfileEditorSection from "@/components/my/MyProfileEditorSection";

export default function MyPage() {
  const { openAlert } = useAlert();
  const { session, supabaseClient, isInitSessionComplete } = useSession();
  const router = useRouter();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);

  const user = session?.user;
  const sessionUserName = getUserName(user);
  const sessionPhone =
    typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
  const sessionAvatar = getAvatarUrl(user);
  const { sessionCompanyName, sessionIsCompanyPublic } = getUserCompany(user);
  const providers = getAuthProviders(user);

  const formMethods = useForm<MyProfileForm>({
    mode: "onSubmit",
    defaultValues: {
      company_name: sessionCompanyName,
      is_company_public: sessionIsCompanyPublic,
      name: sessionUserName,
      phone: sessionPhone,
      avatar: sessionAvatar,
    },
  });
  const { setValue, reset } = formMethods;

  useEffect(() => {
    if (!isInitSessionComplete) return;
    if (session?.access_token) return;
    void replaceSafely(router, "/login?next=/my");
  }, [isInitSessionComplete, router, session?.access_token]);

  useEffect(() => {
    reset({
      name: sessionUserName,
      phone: sessionPhone,
      avatar: sessionAvatar,
      company_name: sessionCompanyName,
      is_company_public: sessionIsCompanyPublic,
    });
  }, [
    reset,
    sessionAvatar,
    sessionPhone,
    sessionUserName,
    sessionCompanyName,
    sessionIsCompanyPublic,
  ]);

  useEffect(() => {
    return () => {
      if (pendingAvatarPreviewUrl) {
        URL.revokeObjectURL(pendingAvatarPreviewUrl);
      }
    };
  }, [pendingAvatarPreviewUrl]);

  const clearPendingAvatar = () => {
    setPendingAvatarFile(null);
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!session?.access_token) {
      event.target.value = "";
      void replaceSafely(router, "/login?next=/my");
      return;
    }

    try {
      validateAvatarFile(file);
    } catch (error) {
      openAlert({
        description: error instanceof Error ? error.message : "아바타 업로드에 실패했습니다.",
      });
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });
    setValue("avatar", previewUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    clearPendingAvatar();
    setValue("avatar", AVATAR_PLACEHOLDER_SRC, { shouldDirty: true, shouldValidate: true });
  };

  const handleResetImage = () => {
    clearPendingAvatar();
    setValue("avatar", sessionAvatar, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (values: MyProfileForm) => {
    if (formMethods.formState.isSubmitting) return;
    if (!supabaseClient || !session?.user || !session.access_token) return;

    const nextName = values.name.trim();
    const nextPhone = values.phone.trim();
    let nextAvatar = values.avatar || AVATAR_PLACEHOLDER_SRC;
    const nextCompanyName = values.company_name.trim();
    const nextIsCompanyPublic = values.is_company_public;

    if (pendingAvatarFile) {
      setIsUploadingAvatar(true);
      try {
        const { avatarUrl } = await uploadAvatarToSupabase(pendingAvatarFile, session.access_token);
        /*
          1. uploadAvatarToSupabase(클라이언트)
          - 파일 기본 검증(validateAvatarFile): file.type, 용량(2MB) 체크
          - FormData로 /api/avatar/upload에 전송
          - 성공 응답이면 avatarUrl/bucket/path 반환, 실패면 에러 throw

          2. /api/avatar/upload(서버)
          - formidable로 파일 파싱
          - 용량 재검증
          - MIME 문자열 정규화(getNormalizedAvatarMimeType)
          - 실제 파일 바이트 시그니처 검사(getDetectedAvatarMimeTypeFromBuffer)로 PNG/JPEG 진짜 여부 확인
          - 검증 통과 시 replaceUserAvatar 실행:
            * Supabase에 업로드
            * 기존 오래된 아바타 정리
            * replacedAvatar 객체(avatarUrl, bucket, path) 생성해서 응답

          즉 핵심은:
          - 맞아, PNG/JPG 확인하고
          - 맞으면 Supabase 업로드 후 필요한 정보 객체를 반환하는 흐름이 맞다.
        */

        /*
          아바타 전체 흐름 파일:

          1. 업로드 API: upload.ts
          2. 이미지 조회 API: [userId].ts
          3. 클라이언트 업로드 호출/검증: client.ts
          4. 저장 처리(Supabase 업로드): storage.server.ts
          5. 경로/URL 생성: path.ts
          6. MIME 정규화/허용 검사: mime.ts
          7. 시그니처 검사: signature.ts
          8. 화면 연결(마이페이지): index.tsx
        */

        /*
          로직 순서

          1. index.tsx
          2. client.ts (uploadAvatarToSupabase, validateAvatarFile)
          3. upload.ts
          4. mime.ts (MIME 정규화)
          5. signature.ts (파일 시그니처 검사)
          6. storage.server.ts (Supabase 업로드)
          7. path.ts (uploadPath, avatarUrl 생성)
          8. index.tsx로 응답 받아 avatar_url 업데이트
          9. 화면 표시 시 ..."> 요청 발생
          10. [userId].ts
          11. path.ts (조회 경로 계산)
          12. mime.ts (응답 MIME 보정)
          13. 이미지 바이너리 응답 -> 화면 렌더링
        */
        nextAvatar = avatarUrl || AVATAR_PLACEHOLDER_SRC;
        clearPendingAvatar();
        setValue("avatar", nextAvatar, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        openAlert({
          description: error instanceof Error ? error.message : "아바타 업로드에 실패했습니다.",
        });
        return;
      } finally {
        setIsUploadingAvatar(false);
      }
    }

    const { error } = await supabaseClient.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        name: nextName,
        phone: nextPhone,
        avatar_url: nextAvatar,
        company_name: nextCompanyName,
        is_company_public: nextIsCompanyPublic,
      },
    });

    if (error) {
      openAlert({
        description: "내 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }

    openAlert({
      description: "내 정보가 저장되었습니다.",
      onOk: () => {
        void replaceSafely(router, "/");
      },
    });
  };

  if (!isInitSessionComplete || !user) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-2xl border border-border/60 bg-background/80 p-7 text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
          로그인 상태를 확인하고 있습니다.
        </section>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <div className="mx-auto w-full max-w-2xl">
        <MyPageHeaderSection />
        <MyProfileEditorSection
          sessionAvatar={sessionAvatar}
          sessionUserName={sessionUserName}
          userEmail={user.email ?? ""}
          providers={providers}
          isUploadingAvatar={isUploadingAvatar}
          onChangeImage={handleChangeImage}
          onRemoveImage={handleRemoveImage}
          onResetImage={handleResetImage}
          onSubmit={onSubmit}
        />
      </div>
    </FormProvider>
  );
}

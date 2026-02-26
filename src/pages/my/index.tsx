import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { Button, useAlert } from "@/components/ui";
import { useSession } from "@/components";
import { replaceSafely } from "@/lib/router.client";
import { useRouter } from "next/router";
import { uploadAvatarToSupabase, validateAvatarFile } from "@/lib/avatarUpload";
import { PHONE_PATTERN, inputBaseStyle, PLACEHOLDER_SRC } from "@/constants";
import {
  formatPhoneNumber,
  getAvatarImageSrc,
  getAuthProviders,
  getAvatarUrl,
  getUserCompany,
  getUserName,
  isPrivateAvatarApiSrc,
} from "@/util";

type MyProfileForm = {
  company_name: string;
  is_company_public: boolean;
  name: string;
  phone: string;
  avatar: string;
};

const providerLabel = (provider: string) => {
  if (provider === "github") return "GitHub";
  if (provider === "email") return "이메일";
  return provider;
};

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
  const sessionAvatar = getAvatarImageSrc(getAvatarUrl(user));
  const { sessionCompanyName, sessionIsCompanyPublic } = getUserCompany(user);
  const providers = getAuthProviders(user);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
  } = useForm<MyProfileForm>({
    mode: "onSubmit",
    defaultValues: {
      company_name: sessionCompanyName,
      is_company_public: sessionIsCompanyPublic,
      name: sessionUserName,
      phone: sessionPhone,
      avatar: sessionAvatar,
    },
  });

  const avatarValue = useWatch({ control, name: "avatar" });
  const avatarSrc = getAvatarImageSrc(avatarValue);
  const hasAvatar = avatarSrc !== PLACEHOLDER_SRC;

  const isCompanyPublic = useWatch({
    control,
    name: "is_company_public",
  });

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

  const handleChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!session?.access_token) {
      openAlert({
        description: "로그인 상태에서만 아바타를 업로드할 수 있습니다.",
      });
      event.target.value = "";
      return;
    }

    try {
      validateAvatarFile(file);
    } catch (error) {
      openAlert({
        description:
          error instanceof Error ? error.message : "아바타 업로드에 실패했습니다.",
      });
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarPreviewUrl(previewUrl);
    setValue("avatar", previewUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setPendingAvatarFile(null);
    setPendingAvatarPreviewUrl(null);
    setValue("avatar", PLACEHOLDER_SRC, { shouldDirty: true, shouldValidate: true });
  };

  const handleResetImage = () => {
    setPendingAvatarFile(null);
    setPendingAvatarPreviewUrl(null);
    setValue("avatar", sessionAvatar, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (values: MyProfileForm) => {
    if (isSubmitting) return;
    if (!supabaseClient || !session?.user || !session.access_token) return;

    const nextName = values.name.trim();
    const nextPhone = values.phone.trim();
    let nextAvatar = getAvatarImageSrc(values.avatar);
    const nextCompanyName = values.company_name.trim();
    const nextIsCompanyPublic = values.is_company_public;

    if (pendingAvatarFile) {
      setIsUploadingAvatar(true);
      try {
        const { avatarUrl } = await uploadAvatarToSupabase(pendingAvatarFile, session.access_token);
        nextAvatar = getAvatarImageSrc(avatarUrl);
        setPendingAvatarFile(null);
        setPendingAvatarPreviewUrl(null);
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

    setValue("avatar", nextAvatar, { shouldDirty: false, shouldValidate: true });

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
    <div className="mx-auto w-full max-w-2xl">
      <section className="rounded-2xl border border-border/60 bg-background/80 p-7 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">마이페이지</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              회원 정보를 확인하고 수정할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/feedback">피드백 목록으로 이동하기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/my/withdraw">회원 탈퇴</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-7 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="grid gap-5 md:grid-cols-[140px_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted text-sm text-muted-foreground">
              <Image
                className="h-full w-full object-cover"
                src={avatarSrc}
                alt="사용자 아바타"
                width={120}
                height={120}
                unoptimized={
                  avatarSrc.startsWith("data:") ||
                  avatarSrc.startsWith("blob:") ||
                  isPrivateAvatarApiSrc(avatarSrc)
                }
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full cursor-pointer">
                <label htmlFor="myAvatarUpload">
                  {isUploadingAvatar
                    ? "업로드 중..."
                    : hasAvatar
                      ? "프로필 변경"
                      : "프로필 업로드"}
                </label>
              </Button>
              <input
                id="myAvatarUpload"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isSubmitting || isUploadingAvatar}
                onChange={handleChangeImage}
              />
              <input type="hidden" {...register("avatar")} />
              {hasAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isUploadingAvatar}
                  onClick={handleRemoveImage}
                >
                  프로필 삭제
                </Button>
              )}
              {sessionAvatar !== PLACEHOLDER_SRC && sessionAvatar !== avatarSrc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isUploadingAvatar}
                  onClick={handleResetImage}
                >
                  프로필 초기화
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">JPG/PNG, 2MB 이하</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{sessionUserName}</p>
            <p className="text-sm text-muted-foreground">{user.email ?? "-"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {providers.map((provider) => (
                <span
                  key={provider}
                  className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {providerLabel(provider)} 로그인
                </span>
              ))}
            </div>
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="my_name">
              이름
            </label>
            <input
              id="my_name"
              type="text"
              className={inputBaseStyle}
              placeholder="이름을 입력해주세요."
              {...register("name", {
                required: "이름을 입력해주세요.",
                setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
              })}
            />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="my_email">
              이메일
            </label>
            <input
              id="my_email"
              type="email"
              className={inputBaseStyle}
              value={user.email ?? ""}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="my_phone">
              휴대폰 번호 (선택)
            </label>
            <input
              id="my_phone"
              type="tel"
              className={inputBaseStyle}
              placeholder="하이픈 없이 입력해도 됩니다."
              {...register("phone", {
                setValueAs: (value) =>
                  typeof value === "string" ? formatPhoneNumber(value.trim()) : value,
                onChange: (event) => {
                  event.target.value = formatPhoneNumber(event.target.value);
                },
                validate: (value) => {
                  if (!value) return true;
                  return (
                    PHONE_PATTERN.test(value.trim()) || "휴대폰 번호 형식이 올바르지 않습니다."
                  );
                },
              })}
            />
            {errors.phone && (
              <span className="text-xs text-destructive">{errors.phone.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="flex items-center gap-2 text-sm text-muted-foreground"
              htmlFor="my_company_name"
            >
              회사명 (선택)
            </label>
            <input
              id="my_company_name"
              type="text"
              className={inputBaseStyle}
              placeholder="회사명을 입력해주세요."
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

            <label
              htmlFor="my_company_public"
              className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                id="my_company_public"
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-border/60 accent-primary"
                {...register("is_company_public", {
                  onChange: (e) => {
                    const checked = e.target.checked;
                    if (!checked) {
                      setValue("company_name", "", { shouldDirty: true });
                      clearErrors("company_name");
                    } else {
                      void trigger("company_name");
                    }
                  },
                })}
              />
              <span>회사명 공개</span>
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting || isUploadingAvatar}>
              내 정보 수정하기
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

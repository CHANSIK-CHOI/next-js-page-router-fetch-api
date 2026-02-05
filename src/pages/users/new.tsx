import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EMAIL_PATTERN, INIT_NEW_USER_VALUE, PHONE_PATTERN, PLACEHOLDER_SRC } from "@/constants";
import { useForm } from "react-hook-form";
import { postUserApi } from "@/lib/users.client";
import { PayloadNewUser, isErrorAlertMsg } from "@/types";
import { useRouter } from "next/router";
import { compressImageFile } from "@/util";
import { uploadAvatarToSupabase } from "@/lib/avatarUpload";
import { Button, useAlert } from "@/components/ui";
import { useSession } from "@/components/useSession";

export default function NewPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { session, isSessionInit } = useSession();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PayloadNewUser>({
    mode: "onSubmit",
    defaultValues: INIT_NEW_USER_VALUE,
  });
  const { openAlert } = useAlert();

  useEffect(() => {
    if (isSessionInit) return;

    if (!session?.access_token) {
      openAlert({
        description: "로그인 후 새로운 유저를 추가할 수 있습니다.",
        onOk: () => {
          router.replace("/");
        },
      });
      return;
    }
  }, [isSessionInit, session, openAlert, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const optimized = await compressImageFile(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      mimeType: "image/jpeg",
      quality: 0.8,
    });

    setAvatarFile(optimized);

    const objectUrl = URL.createObjectURL(optimized);
    setPreviewUrl(objectUrl);

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(null);
    setPreviewUrl("");
  };

  const onSubmit = async (payload: PayloadNewUser) => {
    if (isSubmitting) return;

    const confirmMsg = `${payload.name}님의 데이터를 추가하시겠습니까?`;
    if (!confirm(confirmMsg)) return;

    try {
      const avatarResult = avatarFile ? await uploadAvatarToSupabase(avatarFile) : null;
      const payloadWithAvatar: PayloadNewUser = {
        ...payload,
        avatar: avatarResult?.avatarUrl ?? payload.avatar ?? "",
      };
      await postUserApi(payloadWithAvatar);
      openAlert({
        description: "추가를 완료하였습니다.",
        onOk: () => {
          router.replace("/", undefined, { unstable_skipClientCache: true });
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;
      console.error(err);
      openAlert({
        description: userMessage,
      });
    }
  };

  const handleMyInfo = () => {
    const user = session?.user;
    if (!user) return;

    const metadata = user.user_metadata ?? {};
    const name = String(metadata.name ?? metadata.full_name ?? metadata.user_name ?? "").trim();
    const phone = String(metadata.phone ?? "").trim();
    const avatar_url = metadata.avatar_url;
    const currentValues = getValues();

    setValue("email", user.email ?? currentValues.email, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("name", name || currentValues.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("phone", phone || currentValues.phone || "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (typeof avatar_url === "string" && avatar_url) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setAvatarFile(null);
      setPreviewUrl(avatar_url);
      setValue("avatar", avatar_url, { shouldDirty: true });
    }
  };

  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/`}>뒤로가기</Link>
        </Button>
        <Button type="button" variant="outline" onClick={handleMyInfo}>
          내 정보 입력하기
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[linear-gradient(135deg,#f5f5f5,#d4d4d4)] text-neutral-900 hover:opacity-90"
        >
          {isSubmitting ? "추가 중..." : "추가하기"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900/70">
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-3">
            <Image
              src={previewUrl || PLACEHOLDER_SRC}
              alt=""
              width={140}
              height={140}
              unoptimized
              className="h-[140px] w-[140px] rounded-2xl border border-border/60 bg-muted object-cover dark:border-white/10"
            />

            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-center">
                <label htmlFor="new_avatar" className="cursor-pointer">
                  {previewUrl ? "프로필 변경" : "프로필 추가"}
                </label>
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage}>
                프로필 삭제
              </Button>
              <input
                id="new_avatar"
                type="file"
                accept="image/*"
                hidden
                onChange={handleChangeImage}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <dl className="grid gap-3">
              <dt className="text-sm font-semibold text-muted-foreground">이름</dt>
              <dd className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="first name"
                    className={inputBase}
                    {...register("name", {
                      required: "필수 입력값입니다.",
                      setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                      validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
                    })}
                  />
                  {errors.name && (
                    <span className="text-xs text-destructive">{errors.name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="phone number"
                    className={inputBase}
                    {...register("phone", {
                      setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                      pattern: {
                        value: PHONE_PATTERN,
                        message: "유효한 전화번호 형식이 아닙니다.",
                      },
                    })}
                  />
                  {errors.phone && (
                    <span className="text-xs text-destructive">{errors.phone.message}</span>
                  )}
                </div>
              </dd>
            </dl>

            <dl className="grid gap-3">
              <dt className="text-sm font-semibold text-muted-foreground">email</dt>
              <dd className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="email"
                  className={inputBase}
                  {...register("email", {
                    required: "필수 입력값입니다.",
                    setValueAs: (value) => (typeof value === "string" ? value.trim() : value),
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "유효한 이메일 형식이 아닙니다.",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-xs text-destructive">{errors.email.message}</span>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </form>
  );
}

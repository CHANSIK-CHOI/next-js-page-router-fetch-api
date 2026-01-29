import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from "@/constants";
import { useForm, type FieldErrors } from "react-hook-form";
import { postUserApi } from "@/lib/users.client";
import { PayloadNewUser, isErrorAlertMsg } from "@/types";
import { useRouter } from "next/router";
import { compressImageFile } from "@/util";
import { uploadAvatarToSupabase } from "@/lib/avatarUpload";
import { Button } from "@/components/ui";

export default function NewPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PayloadNewUser>({
    mode: "onSubmit",
    defaultValues: INIT_NEW_USER_VALUE,
  });

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

    const confirmMsg = `${payload.first_name} ${payload.last_name}님의 데이터를 추가하시겠습니까?`;
    if (!confirm(confirmMsg)) return;

    try {
      const avatarResult = avatarFile ? await uploadAvatarToSupabase(avatarFile) : null;
      const payloadWithAvatar: PayloadNewUser = {
        ...payload,
        avatar: avatarResult?.avatarUrl ?? "",
      };
      const result = await postUserApi(payloadWithAvatar);
      console.log(result);
      alert("추가를 완료하였습니다.");
      await router.replace("/", undefined, { unstable_skipClientCache: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;
      console.error(err);
      alert(userMessage);
    }
  };

  const onError = (errors: FieldErrors<PayloadNewUser>) => {
    console.error("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
  };

  const inputBase =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10";

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/`}>뒤로가기</Link>
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[linear-gradient(135deg,#f6b481,#f4a261)] text-slate-900 hover:opacity-90"
        >
          {isSubmitting ? "추가 중..." : "추가하기"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
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
                    {...register("first_name", {
                      required: "필수 입력값입니다.",
                      validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
                    })}
                  />
                  {errors.first_name && (
                    <span className="text-xs text-destructive">{errors.first_name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="last name"
                    className={inputBase}
                    {...register("last_name", {
                      required: "필수 입력값입니다.",
                      validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
                    })}
                  />
                  {errors.last_name && (
                    <span className="text-xs text-destructive">{errors.last_name.message}</span>
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
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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

import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./new-page.module.scss";
import Link from "next/link";
import Image from "next/image";
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from "@/constants";
import { useForm, type FieldErrors } from "react-hook-form";
import { postUserApi } from "@/lib/users.api";
import { PayloadNewUser } from "@/types";
import { useRouter } from "next/router";
import { compressImageFile } from "@/util";
import { uploadAvatarToSupabase } from "@/lib/avatarUpload";

const cx = classNames.bind(styles);

// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default function NewPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
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

    // 이전 previewUrl 정리
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const optimized = await compressImageFile(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      mimeType: "image/jpeg",
      quality: 0.8,
    });

    setAvatarFile(optimized);

    // ✅ 업로드될 파일(optimized)과 동일한 걸로 미리보기
    const objectUrl = URL.createObjectURL(optimized);
    setPreviewUrl(objectUrl);

    // 같은 파일 재선택 가능하도록
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
      await postUserApi(payloadWithAvatar);
      alert("추가를 완료하였습니다.");
      reset();
      setAvatarFile(null);
      setPreviewUrl("");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("유저 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const onError = (errors: FieldErrors<PayloadNewUser>) => {
    console.log("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
  };

  return (
    <form className={cx("new")} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={cx("new__head")}>
        <div className={cx("new__actions")}>
          <Link href={`/`} className="btn btn--line">
            뒤로가기
          </Link>
          <button type="submit" className="btn btn--solid btn--warm" disabled={isSubmitting}>
            {isSubmitting ? "추가 중..." : "추가하기"}
          </button>
        </div>
      </div>
      <div className={cx("new__body")}>
        <div className={cx("new__box")}>
          <div className={cx("new__profile")}>
            <Image
              src={previewUrl || PLACEHOLDER_SRC}
              alt=""
              width={120}
              height={120}
              unoptimized
            />

            <div className={cx("new__profileBtn")}>
              <label htmlFor={`new_avatar`}>{previewUrl ? "프로필 변경" : "프로필 추가"}</label>
              <button type="button" onClick={handleRemoveImage}>
                프로필 삭제
              </button>
              <input
                id={`new_avatar`}
                type="file"
                accept="image/*"
                hidden
                onChange={handleChangeImage}
              />
            </div>
          </div>

          <div className={cx("new__texts")}>
            <dl>
              <dt>이름</dt>
              <dd>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="first name"
                    {...register("first_name", {
                      required: "필수 입력값입니다.",
                      validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
                    })}
                  />
                  {errors.first_name && (
                    <span className="error-msg">{errors.first_name.message}</span>
                  )}
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="last name"
                    {...register("last_name", {
                      required: "필수 입력값입니다.",
                      validate: (value) => !!value.trim() || "공백으로 입력할 수 없습니다.",
                    })}
                  />
                  {errors.last_name && (
                    <span className="error-msg">{errors.last_name.message}</span>
                  )}
                </div>
              </dd>
            </dl>
            <dl>
              <dt>email</dt>
              <dd>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="email"
                    {...register("email", {
                      required: "필수 입력값입니다.",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "유효한 이메일 형식이 아닙니다.",
                      },
                    })}
                  />
                  {errors.email && <span className="error-msg">{errors.email.message}</span>}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </form>
  );
}

import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./new-page.module.scss";
import Link from "next/link";
import Image from "next/image";
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from "@/constants";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { postUserApi } from "@/lib/users.api";
import { PayloadNewUser } from "@/types";
import { useRouter } from "next/router";
import { readFileAsDataURL } from "@/util";

const cx = classNames.bind(styles);

export default function NewPage() {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayloadNewUser>({
    mode: "onSubmit",
    defaultValues: INIT_NEW_USER_VALUE,
  });

  const avatarValue = useWatch({
    control,
    name: "avatar",
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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const base64 = await readFileAsDataURL(file);
    setValue("avatar", base64, { shouldValidate: true });

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (previewUrl == "") return;
    setPreviewUrl("");
    setValue("avatar", "");
  };

  const onSubmit = async (payload: PayloadNewUser) => {
    await postUserApi(payload);
    router.push("/");
  };

  const onError = (errors: FieldErrors<PayloadNewUser>) => {
    console.log("Validation Errors:", errors);
    alert("입력값을 확인해주세요.");
  };

  const displaySrc = previewUrl || (avatarValue ? String(avatarValue) : PLACEHOLDER_SRC);
  const isHasContent = Boolean(avatarValue);

  return (
    <form className={cx("new")} onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={cx("new__head")}>
        <div className={cx("new__actions")}>
          <Link href={`/`} className="btn btn--line">
            뒤로가기
          </Link>
          <button type="submit" className="btn btn--solid btn--warm" disabled={isSubmitting}>
            추가하기
          </button>
        </div>
      </div>
      <div className={cx("new__body")}>
        <div className={cx("new__box")}>
          <div className={cx("new__profile")}>
            <Image src={displaySrc} alt="" width={120} height={120} unoptimized={!displaySrc} />

            <div className={cx("new__profileBtn")}>
              <label htmlFor={`new_avatar`}>{isHasContent ? "프로필 변경" : "프로필 추가"}</label>
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

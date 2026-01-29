import type {
  User,
  PayloadAllModifiedUsers,
  PayloadModifiedUser,
  EditableUserKey,
  UsersFormValues,
} from "@/types";
import { EDITABLE_USER_KEYS } from "@/constants";
import type { FormState } from "react-hook-form";

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

export const getModifiedUsersPayload = (
  dirtyFields: FormState<UsersFormValues>["dirtyFields"],
  currentUsers: User[]
) => {
  const modifiedData: PayloadAllModifiedUsers = [];

  if (!dirtyFields.users || !Array.isArray(dirtyFields.users)) {
    return modifiedData;
  }

  dirtyFields.users.forEach((userDirtyFields, index) => {
    if (!userDirtyFields) return;

    const currentUser = currentUsers[index];
    const payload: PayloadModifiedUser = {};
    const dirtyKeys = Object.keys(userDirtyFields);
    let hasChange = false;

    dirtyKeys.forEach((key) => {
      if (EDITABLE_USER_KEYS.some((editabledKey) => key === editabledKey)) {
        const value = currentUser[key as EditableUserKey];
        payload[key as EditableUserKey] = typeof value === "string" ? value.trim() : value;
        hasChange = true;
      }
    });

    if (hasChange) {
      modifiedData.push({
        id: currentUser.id,
        payload,
      });
    }
  });

  return modifiedData;
};

export async function assertOk(res: Response, msg: string) {
  if (!res.ok) throw new Error(msg);
}

export async function assertOkSupabase(res: Response, msg: string) {
  if (res.statusText !== "OK") throw new Error(msg);
}

export async function compressImageFile(
  file: File,
  opts?: {
    maxWidth?: number;
    maxHeight?: number;
    mimeType?: "image/jpeg" | "image/webp";
    quality?: number; // 0~1
  }
): Promise<File> {
  const { maxWidth = 1024, maxHeight = 1024, mimeType = "image/jpeg", quality = 0.8 } = opts ?? {};

  // 1) 이미지 로드
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = dataUrl;
  });

  // 2) 리사이즈 비율 계산
  let { width, height } = img;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1); // 확대 금지
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  // 3) 캔버스에 그리기
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, width, height);

  // 4) Blob으로 내보내기(압축)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to export image"))),
      mimeType,
      quality
    );
  });

  // 5) File로 재구성
  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const newName = file.name.replace(/\.\w+$/, `.${ext}`);

  return new File([blob], newName, { type: mimeType });
}

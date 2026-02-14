import type {
  User,
  PayloadAllModifiedUsers,
  PayloadModifiedUser,
  EditableUserKey,
  UsersFormValues,
} from "@/types";
import { EDITABLE_USER_KEYS } from "@/constants";
import type { FormState } from "react-hook-form";
import { NextApiRequest } from "next";

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

export function getBaseUrl(req: NextApiRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0].trim()
      : "http";

  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string" && forwardedHost.length > 0
      ? forwardedHost.split(",")[0].trim()
      : req.headers.host;

  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
};

export const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
};

export const getAccessToken = (authHeader: string | undefined) => {
  return typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
};

export const statusBadge = (status: string) => {
  if (status === "approved") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }
  if (status === "revised_pending") {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  }
  return "bg-slate-500/15 text-slate-600 dark:text-slate-300";
};

export const statusLabel = (status: string) => {
  if (status === "approved") return "승인됨";
  if (status === "revised_pending") return "승인 대기(수정됨)";
  return "승인 대기";
};

export const renderStars = (rating: number) => {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(rating);
};

type WithUpdatedAt = { updated_at?: string | null };

export const compareUpdatedAtDesc = (a: WithUpdatedAt, b: WithUpdatedAt) => {
  if (!a.updated_at || !b.updated_at) {
    console.error("compareUpdatedAtDesc: missing updated_at", { a, b });
    return 0;
  }

  const aTime = new Date(a.updated_at).getTime();
  const bTime = new Date(b.updated_at).getTime();

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    console.error("compareUpdatedAtDesc: invalid updated_at", { a, b });
    return 0;
  }

  return bTime - aTime;
};

export const mergeAndSortByUpdatedAtDesc = <T extends WithUpdatedAt>(...arrays: T[][]): T[] => {
  return arrays.flat().sort(compareUpdatedAtDesc);
};

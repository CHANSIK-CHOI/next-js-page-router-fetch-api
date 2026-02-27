import { AVATAR_MAX_FILE_SIZE } from "@/lib/avatar/constants";
import { getNormalizedAvatarMimeType } from "@/lib/avatar/mime";
import type { AvatarUploadResponse, AvatarUploadResult } from "@/types/avatar/upload";

export const validateAvatarFile = (file: File) => {
  const isAvatarMimeTypeAllowed = getNormalizedAvatarMimeType(file.type) !== null;

  if (!isAvatarMimeTypeAllowed) {
    throw new Error("프로필 이미지는 JPG/PNG 파일만 업로드할 수 있습니다. (SVG 불가)");
  }

  if (file.size > AVATAR_MAX_FILE_SIZE) {
    throw new Error("프로필 이미지는 2MB 이하만 업로드할 수 있습니다.");
  }
};

export async function uploadAvatarToSupabase(
  file: File,
  accessToken: string
): Promise<AvatarUploadResult> {
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  validateAvatarFile(file);

  const formData = new FormData();
  formData.append("avatar", file);

  const uploadRes = await fetch("/api/avatar/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const uploadBody: AvatarUploadResponse | null = await uploadRes.json().catch(() => null);

  if (!uploadRes.ok || !uploadBody || "error" in uploadBody) {
    const errorMessage =
      uploadBody && "error" in uploadBody ? uploadBody.error : "아바타 업로드에 실패했습니다.";
    throw new Error(errorMessage);
  }

  return uploadBody;
}

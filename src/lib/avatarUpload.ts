import { MAX_AVATAR_FILE_SIZE } from "@/constants";
import type { AvatarUploadResponse, AvatarUploadResult } from "@/types";

export const validateAvatarFile = (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_AVATAR_FILE_SIZE) {
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

  // FormData 생성 후 avatar 키로 파일 추가
  const formData = new FormData();
  formData.append("avatar", file);

  const uploadRes = await fetch("/api/avatar/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const uploadBody = (await uploadRes.json().catch(() => null)) as AvatarUploadResponse | null;
  if (!uploadRes.ok || !uploadBody || "error" in uploadBody) {
    const errorMessage =
      uploadBody && "error" in uploadBody ? uploadBody.error : "아바타 업로드에 실패했습니다.";
    throw new Error(errorMessage);
  }

  return uploadBody;
}

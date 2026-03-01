import { AVATAR_ALLOWED_MIME_TYPES } from "@/constants";
import type { AvatarMimeType } from "@/types/avatar";

const MIME_TYPE_ALIASES: Record<string, AvatarMimeType> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

export const getNormalizedAvatarMimeType = (mimeType: string): AvatarMimeType | null => {
  const normalized = mimeType.toLowerCase();

  if (normalized in MIME_TYPE_ALIASES) {
    // 객체에 해당 key가 있는지 확인
    return MIME_TYPE_ALIASES[normalized];
  }

  return AVATAR_ALLOWED_MIME_TYPES.includes(normalized as AvatarMimeType)
    ? (normalized as AvatarMimeType)
    : null;
};

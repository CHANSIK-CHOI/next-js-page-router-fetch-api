import type { AvatarMimeType } from "@/types/avatar/mime";

// 파일 맨 앞에 오는 고정 바이트(매직 바이트) 정의
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;

export const checkBufferSignature = (buffer: Buffer, signature: readonly number[]) =>
  buffer.length >= signature.length && signature.every((byte, index) => buffer[index] === byte);

// buffer.length >= signature.length -> 파일이 시그니처 길이보다 짧으면 비교 자체가 불가능해서 먼저 걸러냄
// signature.every(...): -> 시그니처의 각 바이트를 순서대로 비교해서 전부 같아야 true

export const detectAvatarMimeTypeFromBuffer = (buffer: Buffer): AvatarMimeType | null => {
  if (checkBufferSignature(buffer, PNG_SIGNATURE)) return "image/png";
  if (checkBufferSignature(buffer, JPEG_SIGNATURE)) return "image/jpeg";
  return null;
};

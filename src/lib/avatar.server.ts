import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvatarUploadResult } from "@/types";
import { buildAvatarDirectory, buildAvatarPath, buildAvatarProxyUrl } from "@/util";

export type ReplaceUserAvatarParams = {
  supabaseServer: SupabaseClient;
  bucket: string;
  userId: string;
  fileBuffer: Buffer;
  contentType: string;
};

export type ReplaceUserAvatarResult = AvatarUploadResult;

// 해당 유저 폴더 안에 있는 기존 아바타 파일 경로 목록을 가져오는 함수
const listUserAvatarPaths = async (
  supabaseServer: SupabaseClient,
  bucket: string,
  userId: string
): Promise<string[]> => {
  const directory = buildAvatarDirectory(userId);
  const { data, error } = await supabaseServer.storage.from(bucket).list(directory, {
    limit: 100, // 최대 100개
    sortBy: { column: "name", order: "asc" }, // 이름 오름차순
  });

  if (error) {
    // 조회 에러면 로그 출력 후 예외 throw - 업로드 교체 전에 기존 파일을 못 찾았다는 의미
    console.error("Failed to list user avatar objects", { bucket, directory, error });
    throw new Error("기존 아바타 목록을 확인하지 못했습니다.");
  }

  return (data ?? [])
    .filter((item) => Boolean(item.id || item.metadata))
    .map((item) => `${directory}/${item.name}`);
};

export async function replaceUserAvatar({
  supabaseServer,
  bucket,
  userId,
  fileBuffer,
  contentType,
}: ReplaceUserAvatarParams): Promise<ReplaceUserAvatarResult> {
  const uploadPath = buildAvatarPath(userId);

  const { error: uploadError } = await supabaseServer.storage
    .from(bucket)
    .upload(uploadPath, fileBuffer, {
      contentType, // MIME 타입 지정(예: image/png)
      cacheControl: "3600", // "3600": 캐시 3600초
      upsert: true, // 같은 경로 파일이 있으면 덮어쓰기 허용
    });

  if (uploadError) {
    console.error("Failed to upload new avatar object", { bucket, uploadPath, uploadError });
    throw new Error("새 아바타 업로드에 실패했습니다.");
  }

  // 업로드 성공 후, 현재 업로드 경로를 제외한 이전 파일을 정리한다.
  // 정리 실패가 있어도 업로드 성공은 유지한다.
  try {
    const listedAvatarPaths = await listUserAvatarPaths(supabaseServer, bucket, userId);
    const staleAvatarPaths = listedAvatarPaths.filter((path) => path !== uploadPath);

    if (staleAvatarPaths.length > 0) {
      const { error: removeError } = await supabaseServer.storage.from(bucket).remove(staleAvatarPaths);
      if (removeError) {
        console.error("Failed to remove stale avatar objects", {
          bucket,
          staleAvatarPaths,
          removeError,
        });
      }
    }
  } catch (cleanupError) {
    console.error("Failed to cleanup old avatar objects", { bucket, userId, cleanupError });
  }

  return {
    bucket,
    path: uploadPath,
    avatarUrl: buildAvatarProxyUrl(userId),
  };
}

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

const listUserAvatarPaths = async (
  supabaseServer: SupabaseClient,
  bucket: string,
  userId: string
): Promise<string[]> => {
  const directory = buildAvatarDirectory(userId);
  const { data, error } = await supabaseServer.storage.from(bucket).list(directory, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
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
  const oldAvatarPaths = await listUserAvatarPaths(supabaseServer, bucket, userId);

  if (oldAvatarPaths.length > 0) {
    const { error: removeError } = await supabaseServer.storage.from(bucket).remove(oldAvatarPaths);
    if (removeError) {
      console.error("Failed to remove previous avatar objects", { bucket, oldAvatarPaths, removeError });
      throw new Error("기존 아바타 삭제에 실패했습니다.");
    }
  }

  const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(uploadPath, fileBuffer, {
    contentType,
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    console.error("Failed to upload new avatar object", { bucket, uploadPath, uploadError });
    throw new Error("새 아바타 업로드에 실패했습니다.");
  }

  return {
    bucket,
    path: uploadPath,
    avatarUrl: buildAvatarProxyUrl(userId),
  };
}

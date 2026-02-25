import type { SupabaseClient } from "@supabase/supabase-js";

const AVATAR_ROOT = "users";
const AVATAR_FILENAME = "avatar";

export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;

export type ReplaceUserAvatarParams = {
  supabaseServer: SupabaseClient;
  bucket: string;
  userId: string;
  fileBuffer: Buffer;
  contentType: string;
};

export type ReplaceUserAvatarResult = {
  bucket: string;
  path: string;
  avatarUrl: string;
};

const buildAvatarDirectory = (userId: string) => `${AVATAR_ROOT}/${userId}`;
const buildAvatarPath = (userId: string) => `${buildAvatarDirectory(userId)}/${AVATAR_FILENAME}`;
const buildAvatarProxyUrl = (userId: string) =>
  `/api/avatar/${encodeURIComponent(userId)}?t=${Date.now()}`;

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
      throw new Error("기존 아바타 삭제에 실패했습니다.");
    }
  }

  const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(uploadPath, fileBuffer, {
    contentType,
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    throw new Error("새 아바타 업로드에 실패했습니다.");
  }

  return {
    bucket,
    path: uploadPath,
    avatarUrl: buildAvatarProxyUrl(userId),
  };
}

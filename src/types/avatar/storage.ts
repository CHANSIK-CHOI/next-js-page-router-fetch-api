import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvatarMimeType } from "@/types/avatar/mime";
import type { AvatarUploadResult } from "@/types/avatar/upload";

export type ReplaceUserAvatarParams = {
  supabaseServer: SupabaseClient;
  bucket: string;
  userId: string;
  fileBuffer: Buffer;
  contentType: AvatarMimeType;
};

export type ReplaceUserAvatarResult = AvatarUploadResult;

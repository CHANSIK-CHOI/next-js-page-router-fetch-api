// src/lib/avatarUpload.ts
import { getSupabaseClient } from "@/lib/supabase.client";

type IssueUploadUrlResponse =
  | { bucket: string; path: string; token: string; signedUrl: string }
  | { error: string };

export async function uploadAvatarToSupabase(file: File, userId?: string) {
  // 1) 서버에서 signed upload url 발급
  const issue = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mime: file.type, userId }),
  }).then((r) => r.json() as Promise<IssueUploadUrlResponse>);

  if ("error" in issue) throw new Error(issue.error);

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // 2) signed url로 직접 업로드 :contentReference[oaicite:5]{index=5}
  const { error: uploadError } = await supabaseClient.storage
    .from(issue.bucket)
    .uploadToSignedUrl(issue.path, issue.token, file, {
      contentType: file.type,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicData } = supabaseClient.storage.from(issue.bucket).getPublicUrl(issue.path);
  const avatarUrl = publicData.publicUrl;

  if (!avatarUrl) throw new Error("Failed to create public avatar url");

  // DB/외부 API에는 public url 저장
  return { avatarUrl, bucket: issue.bucket, path: issue.path };
}

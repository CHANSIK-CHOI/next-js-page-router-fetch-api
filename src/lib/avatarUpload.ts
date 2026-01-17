import { getSupabaseClient } from "@/lib/supabase.client";

// 아바타 파일을 Supabase Storage에 올리고, 공개 URL을 만들어 반환”하는 함수
// getSupabaseClient()는 브라우저에서 쓰는 public(anon) 키 기반 클라이언트
type IssueUploadUrlResponse =
  | { bucket: string; uploadPath: string; uploadToken: string; signedUploadUrl: string }
  | { error: string };

export async function uploadAvatarToSupabase(file: File, userId?: string) {
  const signedUpload = await fetch("/api/signed-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mime: file.type, userId }),
  }).then((r) => r.json() as Promise<IssueUploadUrlResponse>);

  if ("error" in signedUpload) throw new Error(signedUpload.error);

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // Storage에 실제 업로드
  const { error: uploadError } = await supabaseClient.storage
    .from(signedUpload.bucket)
    .uploadToSignedUrl(signedUpload.uploadPath, signedUpload.uploadToken, file, {
      contentType: file.type,
    });

  if (uploadError) throw new Error(uploadError.message);

  // getPublicUrl(issue.path)로 공개 URL을 얻음
  const { data: publicData } = supabaseClient.storage
    .from(signedUpload.bucket)
    .getPublicUrl(signedUpload.uploadPath);
  const avatarUrl = publicData.publicUrl;

  if (!avatarUrl) throw new Error("Failed to create public avatar url");

  const avatarResult = {
    avatarUrl,
    bucket: signedUpload.bucket,
    path: signedUpload.uploadPath,
  };
  return avatarResult;
}

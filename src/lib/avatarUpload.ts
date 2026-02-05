import { getSupabaseClient } from "@/lib/supabase.client";
import { ErrorAlertMsg } from "@/types";

// 아바타 파일을 Supabase Storage에 올리고, 공개 URL을 만들어 반환”하는 함수
// getSupabaseClient()는 브라우저에서 쓰는 public(anon) 키 기반 클라이언트
type IssueUploadUrlResponse =
  | { bucket: string; uploadPath: string; uploadToken: string; signedUploadUrl: string }
  | { error: string; alertMsg?: string };

export async function uploadAvatarToSupabase(file: File, userId?: string) {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    const error: ErrorAlertMsg = new Error("Unauthorized");
    error.alertMsg = "로그인이 필요합니다.";
    throw error;
  }

  const signedUpload = await fetch("/api/signed-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ mime: file.type, userId }),
  }).then((r) => r.json() as Promise<IssueUploadUrlResponse>);

  if ("error" in signedUpload) {
    const error: ErrorAlertMsg = new Error(signedUpload.error);
    if (signedUpload.alertMsg) error.alertMsg = signedUpload.alertMsg;
    throw error;
  }

  // Storage에 실제 업로드
  const { error: uploadError } = await supabaseClient.storage
    .from(signedUpload.bucket)
    .uploadToSignedUrl(signedUpload.uploadPath, signedUpload.uploadToken, file, {
      contentType: file.type,
    });

  if (uploadError) {
    const error: ErrorAlertMsg = new Error(uploadError.message);
    error.alertMsg = "이미지를 등록할 수 없습니다. 관리자에게 문의 부탁드립니다.";
    throw error;
  }

  // getPublicUrl(issue.path)로 공개 URL을 얻음
  const { data: publicData } = supabaseClient.storage
    .from(signedUpload.bucket)
    .getPublicUrl(signedUpload.uploadPath);
  const avatarUrl = publicData.publicUrl;

  if (!avatarUrl)
    throw new Error("이미지의 경로를 받아올 수 없습니다. 관리자에게 문의 부탁드립니다.");

  const avatarResult = {
    avatarUrl,
    bucket: signedUpload.bucket,
    path: signedUpload.uploadPath,
  };
  return avatarResult;
}

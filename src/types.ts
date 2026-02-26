import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseError = PostgrestError | null;

export type ApiErrorResponse = {
  error: string;
};

export type AvatarUploadResult = {
  avatarUrl: string;
  bucket: string;
  path: string;
};

export type AvatarUploadResponse = AvatarUploadResult | ApiErrorResponse;

export type LoginForm = {
  login_email: string;
  login_password: string;
};

export type SignUpForm = {
  signup_name?: string;
  signup_phone?: string;
  signup_email: string;
  signup_password: string;
};

// Backward compatibility alias for existing imports.
export type SingUpForm = SignUpForm;

/*
  id: string; // UUID
  author_id: string; // 작성자 Auth.uid
  display_name: string; // 공개 보드에 표시할 이름
  company_name: string; // 회사명
  is_company_public: boolean; // 회사명 공개 여부
  avatar_url?: string; // 작성자 프로필 이미지 URL
  email: string; // 이메일
  summary: string; // 피드백 상세
  strengths?: string; // 강점
  questions?: string; // 질문
  suggestions?: string; // 개선 제안
  rating: number; // 별점
  tags: string[]; // 키워드
  status: "pending" | "approved" | "rejected" | "revised_pending"; // 승인 상태
  // approved : 승인됨
  // revised_pending : 승인 대기(수정됨)
  // pending : 승인 대기
  // rejected : 거절됨
  is_public: boolean; // 공개 보드 노출 여부
  revision_count: number; // 승인 후 수정 횟수
  created_at: string; // 작성일
  updated_at: string; // 수정일
  reviewed_at?: string; // 검토/승인/반려한 시간
  reviewed_by?: string; // 승인 담당자
*/

export type FeedbackPublicBase = {
  id: string;
  author_id: string;
  display_name: string;
  company_name: string | null;
  is_company_public: boolean;
  avatar_url: string | null;
  is_public: boolean;
  revision_count: number;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type FeedbackPublicRow = FeedbackPublicBase & {
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
  status: "pending" | "approved" | "rejected" | "revised_pending";
};

export type FeedbackPrivateRow = FeedbackPublicRow & {
  email: string;
};

export type ApprovedFeedback = FeedbackPublicBase & {
  status: "approved";
  isPreview: false;
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
};

export type RevisedPendingPreviewFeedback = FeedbackPublicBase & {
  status: "revised_pending";
  isPreview: true;
};

export type RevisedPendingOwnerFeedback = FeedbackPublicBase & {
  status: "revised_pending" | "pending";
  isPreview: false;
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
};

type AdminReviewBase = FeedbackPrivateRow & {
  isPreview: false;
};

// 관리자 화면에서 이메일을 실제로 써야 할 때 내부적으로 사용할 타입
export type AdminReviewFeedbackWithEmail = AdminReviewBase;

// 기본 정책: 클라이언트 전달 시 이메일 제외
export type AdminReviewFeedback = Omit<AdminReviewBase, "email">;

export type FeedbackListItem =
  | ApprovedFeedback
  | RevisedPendingPreviewFeedback
  | RevisedPendingOwnerFeedback
  | AdminReviewFeedback;

export type UserRole = {
  user_id: string; // Auth 유저의 UID
  role: "admin" | "reviewer"; // 권한 역할
  created_at?: string; // 역할이 부여된 시각 기록
};

export type UserRoleSyncResponse = {
  role: UserRole["role"] | null;
  error: string | null;
};

export type FeedbackNewFormValues = {
  display_name: string;
  company_name: string;
  is_company_public: boolean;
  avatar: string;
  rating: number;
  summary: string;
  strengths: string;
  questions: string;
  suggestions: string;
  tags: string[];
};

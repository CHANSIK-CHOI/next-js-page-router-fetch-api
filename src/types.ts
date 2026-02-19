import { PostgrestError } from "@supabase/supabase-js";

export type SupabaseError = PostgrestError | null;

export type LoginForm = {
  login_email: string;
  login_password: string;
};

export type SingUpForm = {
  signup_name?: string;
  signup_phone?: string;
  signup_email: string;
  signup_password: string;
};

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

export type FeedbackBase = {
  id: string;
  author_id: string;
  display_name: string;
  company_name: string | null;
  is_company_public: boolean;
  avatar_url: string | null;
  email: string;
  is_public: boolean;
  revision_count: number;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type FeedbackRow = FeedbackBase & {
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
  status: "pending" | "approved" | "rejected" | "revised_pending";
};

export type ApprovedFeedback = FeedbackBase & {
  status: "approved";
  isPreview: false;
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
};

export type RevisedPendingPreviewFeedback = FeedbackBase & {
  status: "revised_pending";
  isPreview: true;
};

export type RevisedPendingOwnerFeedback = FeedbackBase & {
  status: "revised_pending" | "pending";
  isPreview: false;
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
};

export type AdminReviewFeedback = FeedbackBase & {
  status: "pending" | "approved" | "revised_pending" | "rejected";
  isPreview: false;
  summary: string;
  strengths: string | null;
  questions: string | null;
  suggestions: string | null;
  rating: number;
  tags: string[];
};

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

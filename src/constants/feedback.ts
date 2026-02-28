import { AVATAR_PLACEHOLDER_SRC } from "@/constants/avatar";
import type { FeedbackNewFormValues } from "@/types/forms";

export const APPROVED_PUBLIC_COLUMNS =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, summary, strengths, questions, suggestions, rating, tags, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

export const PREVIEWCOLUMN =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

export const NEW_FEEDBACK_DEFAULT_VALUES: FeedbackNewFormValues = {
  display_name: "",
  company_name: "",
  is_company_public: false,
  avatar: AVATAR_PLACEHOLDER_SRC,
  rating: 0,
  summary: "",
  strengths: "",
  questions: "",
  suggestions: "",
  tags: [],
};

export const TAG_OPTIONS = [
  "문제 해결력",
  "코드 가독성",
  "코드 구조",
  "컴포넌트 설계",
  "상태 관리",
  "성능 최적화",
  "접근성",
  "반응형 UI",
  "UX",
  "디자인 완성도",
  "일관성",
  "API 연동",
  "에러 처리",
  "테스트 품질",
  "형상 관리",
  "문서화",
  "배포",
  "보안 인식",
  "성장 가능성",
];

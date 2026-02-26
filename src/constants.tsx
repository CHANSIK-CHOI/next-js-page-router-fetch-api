import type { FeedbackNewFormValues, LoginForm, SignUpForm } from "@/types";

export const PLACEHOLDER_SRC = "https://placehold.co/100x100.png?text=Hello+World";
export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;

export const LOGIN_EMAIL_FORM: LoginForm = {
  login_email: "",
  login_password: "",
};

export const SIGNUP_EMAIL_FORM: SignUpForm = {
  signup_name: "",
  signup_email: "",
  signup_password: "",
};

// Backward compatibility alias for existing imports.
export const SINGUP_EMAIL_FORM = SIGNUP_EMAIL_FORM;

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;

export const APPROVED_PUBLIC_COLUMNS =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, summary, strengths, questions, suggestions, rating, tags, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

export const PREVIEWCOLUMN =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

export const NEW_FEEDBACK_DEFAULT_VALUES: FeedbackNewFormValues = {
  display_name: "",
  company_name: "",
  is_company_public: false,
  avatar: PLACEHOLDER_SRC,
  rating: 0,
  summary: "",
  strengths: "",
  questions: "",
  suggestions: "",
  tags: [],
};

export const inputBaseStyle =
  "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 read-only:cursor-default read-only:bg-muted/60 read-only:text-muted-foreground read-only:focus-visible:ring-0";

export const chipButtonBaseStyle =
  "rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary";

export const TAG_OTIONS = [
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

import type { LoginForm, SingUpForm } from "@/types";

export const PLACEHOLDER_SRC = "https://placehold.co/100x100.png?text=Hello+World";

export const LOGIN_EMAIL_FORM: LoginForm = {
  login_email: "",
  login_password: "",
};

export const SINGUP_EMAIL_FORM: SingUpForm = {
  signup_name: "",
  signup_phone: "",
  signup_email: "",
  signup_password: "",
};

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;

export const APPROVED_PUBLIC_COLUMNS =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, summary, strengths, questions, suggestions, rating, tags, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

export const PREVIEWCOLUMN =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

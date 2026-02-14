import type { EditableUserKey, InitUserFormObject, LoginForm, SingUpForm } from "@/types";

export const PLACEHOLDER_SRC = "https://placehold.co/100x100?text=Hello+World";

export const INIT_NEW_USER_VALUE: InitUserFormObject = {
  email: "",
  name: "",
  phone: "",
  avatar: undefined,
};

export const EDITABLE_USER_KEYS: EditableUserKey[] = ["email", "name", "phone", "avatar"];

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

export const FAILED_POST_MSG = "새로운 유저를 추가할 수 없습니다. 관리자에게 문의 부탁드립니다.";

export const PREVIEWCOLUMN =
  "id, author_id, display_name, company_name, is_company_public, avatar_url, email, status, is_public, revision_count, created_at, updated_at, reviewed_at, reviewed_by";

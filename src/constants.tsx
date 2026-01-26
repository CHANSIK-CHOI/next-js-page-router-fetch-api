import type { EditableUserKey, InitUserFormObject, LoginForm, SingUpForm } from "@/types";

export const PLACEHOLDER_SRC = "https://placehold.co/100x100?text=Hello+World";

export const INIT_NEW_USER_VALUE: InitUserFormObject = {
  email: "",
  first_name: "",
  last_name: "",
  avatar: undefined,
};

export const EDITABLE_USER_KEYS: EditableUserKey[] = ["email", "first_name", "last_name", "avatar"];

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

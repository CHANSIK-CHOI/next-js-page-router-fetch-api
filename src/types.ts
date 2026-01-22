export type User = {
  avatar: string;
  created_at?: string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
};

type UserKeys = keyof User;
// key
export type EditableUserKey = Exclude<UserKeys, "id">;
type RequiredEditableUserKey = Exclude<EditableUserKey, "avatar">;

// object
export type InitUserFormObject = Pick<User, RequiredEditableUserKey> & { avatar?: User["avatar"] };
type EditableUserFormObject = Partial<Omit<User, "id">>;

// POST
export type PayloadNewUser = InitUserFormObject;
export type ApiResultNewUser = User & { createdAt: string };
export type ApiResponseNewUser = {
  data: User;
  revalidated: boolean;
};

// PATCH
export type PayloadModifiedUser = EditableUserFormObject;
export type ApiResultModifiedUser = PayloadModifiedUser & { updatedAt: string };
export type PayloadAllModifiedUsers = { id: User["id"]; payload: EditableUserFormObject }[];
export type ApiResultAllModifiedUsers = {
  id: User["id"];
  result: ApiResultModifiedUser;
}[];

// DELETE
export type ApiResponseDeleteUser = {
  data: User[];
  revalidated: boolean;
};

// react form hooks
export type UsersFormValues = {
  users: User[];
};

export type ErrorAlertMsg = Error & { alertMsg?: string };

export const isErrorAlertMsg = (err: unknown): err is ErrorAlertMsg =>
  err instanceof Error && "alertMsg" in err;

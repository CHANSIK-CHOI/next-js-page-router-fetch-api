export type UserRole = {
  user_id: string; // Auth 유저의 UID
  role: "admin" | "reviewer"; // 권한 역할
  created_at?: string; // 역할이 부여된 시각 기록
};

export type UserRoleSyncResponse = {
  role: UserRole["role"] | null;
  error: string | null;
};

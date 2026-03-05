import type { UserRole } from "@/types/user-role";

export type SyncUserRoleResult = {
  role: UserRole["role"];
  isNewUser: boolean;
};

type UserRoleSyncResponse = {
  data: {
    role: UserRole["role"];
    isNewUser: boolean;
  } | null;
  error: string | null;
};

export async function syncUserRole(accessToken: string): Promise<SyncUserRoleResult> {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const response = await fetch("/api/user-roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload: UserRoleSyncResponse | null = await response.json().catch(() => null);

  if (!response.ok || !payload || payload.error || !payload.data?.role) {
    throw new Error(payload?.error ?? "Failed Post user roles");
  }

  return {
    role: payload.data.role,
    isNewUser: payload.data.isNewUser,
  };
}

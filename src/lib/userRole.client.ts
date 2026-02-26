import type { UserRole, UserRoleSyncResponse } from "@/types";

export type SyncUserRoleResult = {
  role: UserRole["role"];
  isNewUser: boolean;
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

  const payload = (await response.json().catch(() => null)) as UserRoleSyncResponse | null;

  if (!response.ok || !payload || payload.error || !payload.role) {
    throw new Error(payload?.error ?? "Failed Post user roles");
  }

  return {
    role: payload.role,
    isNewUser: response.status === 201,
  };
}

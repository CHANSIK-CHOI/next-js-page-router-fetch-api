import type { User } from "@/types";
import { assertOk } from "@/util";

const BASE_URL = process.env.USER_SECRET_API_URL;
const API_KEY = process.env.USER_SECRET_API_KEY;
const authHeaders: HeadersInit = API_KEY ? { "x-api-key": API_KEY } : {};

export const getUserApi = async <T extends User | User[]>(
  id?: User["id"]
): Promise<{ data: T }> => {
  const url = id ? `${BASE_URL}/users?id=${id}` : `${BASE_URL}/users?page=1&per_page=12`;

  const response = await fetch(url, {
    headers: authHeaders,
  });

  await assertOk(response, "유저 데이터를 받아올 수 없습니다.");
  const result = await response.json();
  return result as { data: T };
};

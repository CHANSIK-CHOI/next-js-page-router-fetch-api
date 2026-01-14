import type {
  PayloadModifiedUser,
  PayloadAllModifiedUsers,
  PayloadNewUser,
  ApiResultModifiedUser,
  ApiResultAllModifiedUsers,
  ApiResultNewUser,
  User,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const authHeaders: HeadersInit = API_KEY ? { "x-api-key": API_KEY } : {};

export const getUserApi = async <T extends User | User[]>(
  id?: User["id"]
): Promise<{ data: T }> => {
  const url = id ? `${BASE_URL}/users?id=${id}` : `${BASE_URL}/users?page=1&per_page=12`;

  const response = await fetch(url, {
    headers: authHeaders,
  });

  if (!response.ok) throw Error("유저 데이터를 받아올 수 없습니다.");
  const result = await response.json();
  return result;
};

export const postUserApi = async (payload: PayloadNewUser) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw Error("유저 데이터를 추가할 수 없습니다.");
  const result: ApiResultNewUser = await response.json();
  return result;
};

export const patchUserApi = async (id: User["id"], payload: PayloadModifiedUser) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw Error("유저 데이터를 수정할 수 없습니다.");
  const result: ApiResultModifiedUser = await response.json();
  return result;
};

export const patchAllUsersApi = async (data: PayloadAllModifiedUsers) => {
  const responses = await Promise.all(
    data.map(({ id, payload }) =>
      fetch(`${BASE_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    )
  );
  const isError = responses.some((res) => !res.ok);
  if (isError) throw Error("유저 데이터를 수정할 수 없습니다.");

  const results: ApiResultAllModifiedUsers = await Promise.all(
    responses.map((res, idx) =>
      res.json().then((body) => ({ id: data[idx].id, result: { ...body } }))
    )
  );
  return results;
};

export const deleteUserApi = async (id: User["id"]) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  if (!response.ok) throw Error("유저 데이터를 삭제할 수 없습니다.");
  const isSuccess = response.status === 204 ? true : false;
  return isSuccess;
};

export const deleteSelectedUsersApi = async (ids: User["id"][]) => {
  const responses = await Promise.all(
    ids.map((id) =>
      fetch(`${BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      })
    )
  );

  const isError = responses.some((res) => !res.ok);
  if (isError) throw Error("유저 데이터를 삭제할 수 없습니다.");

  const isAllSuccess = !(
    await Promise.all(responses.map((res) => (res.status === 204 ? true : false)))
  ).includes(false);
  return isAllSuccess;
};

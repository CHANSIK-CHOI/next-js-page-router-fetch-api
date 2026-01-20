import type { PayloadNewUser, User } from "@/types";

// const BASE_URL = process.env.USER_SECRET_API_URL;
// const API_KEY = process.env.USER_SECRET_API_KEY;
// const authHeaders: HeadersInit = API_KEY ? { "x-api-key": API_KEY } : {};

export const postUserApi = async (payload: PayloadNewUser) => {
  const response = await fetch("/api/post-new-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { error, alertMsg } = await response.json();
    console.error(error);
    const err = new Error(error ?? alertMsg ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }
};

export const deleteUserApi = async (ids: User["id"][]) => {
  const response = await fetch("/api/delete-user", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });

  if (!response.ok) {
    const { error, alertMsg } = await response.json();
    console.error(error);
    const err = new Error(error ?? alertMsg ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }
};

// export const patchUserApi = async (id: User["id"], payload: PayloadModifiedUser) => {
//   const response = await fetch(`${BASE_URL}/users/${id}`, {
//     method: "PATCH",
//     headers: {
//       ...authHeaders,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) throw Error("유저 데이터를 수정할 수 없습니다.");
//   const result: ApiResultModifiedUser = await response.json();
//   return result;
// };

// export const patchAllUsersApi = async (data: PayloadAllModifiedUsers) => {
//   const responses = await Promise.all(
//     data.map(({ id, payload }) =>
//       fetch(`${BASE_URL}/users/${id}`, {
//         method: "PATCH",
//         headers: {
//           ...authHeaders,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       })
//     )
//   );
//   const isError = responses.some((res) => !res.ok);
//   if (isError) throw Error("유저 데이터를 수정할 수 없습니다.");

//   const results: ApiResultAllModifiedUsers = await Promise.all(
//     responses.map((res, idx) =>
//       res.json().then((body) => ({ id: data[idx].id, result: { ...body } }))
//     )
//   );
//   return results;
// };

// export const deleteUserApi = async (id: User["id"]) => {
//   const response = await fetch(`${BASE_URL}/users/${id}`, {
//     method: "DELETE",
//     headers: authHeaders,
//   });

//   if (!response.ok) throw Error("유저 데이터를 삭제할 수 없습니다.");
//   const isSuccess = response.status === 204 ? true : false;
//   return isSuccess;
// };

//   const isError = responses.some((res) => !res.ok);
//   if (isError) throw Error("유저 데이터를 삭제할 수 없습니다.");

//   const isAllSuccess = !(
//     await Promise.all(responses.map((res) => (res.status === 204 ? true : false)))
//   ).includes(false);
//   return isAllSuccess;
// };

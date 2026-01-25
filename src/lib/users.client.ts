import type { ApiResponseDeleteUser, ApiResponseNewUser, PayloadNewUser, User } from "@/types";

// const BASE_URL = process.env.USER_SECRET_API_URL;
// const API_KEY = process.env.USER_SECRET_API_KEY;
// const authHeaders: HeadersInit = API_KEY ? { "x-api-key": API_KEY } : {};

type ErrorBody = { error?: string; alertMsg?: string };
const readErrorBody = async (response: Response): Promise<ErrorBody & { rawText?: string }> => {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  console.log("contentType : ", contentType);
  console.log("isJson : ", isJson);

  const cloned = response.clone();
  try {
    if (!isJson) {
      throw new Error("Non-JSON response");
    }
    const json: ErrorBody = await cloned.json();
    return json ?? {};
  } catch {
    // 서버가 JSON이 아닌 방식으로 내려준 응답 본문 전체 문자열 : ex) res.status(500).send("Internal Server Error")
    try {
      const rawText = await response.text();
      return rawText ? { rawText } : {};
    } catch {
      return {};
    }
  }
};

export const postUserApi = async (payload: PayloadNewUser): Promise<ApiResponseNewUser> => {
  const response = await fetch("/api/post-new-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-cache",
  });

  if (!response.ok) {
    const { error, alertMsg, rawText } = await readErrorBody(response);
    if (error) console.error(error);
    const err = new Error(error ?? alertMsg ?? rawText ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }

  const result: ApiResponseNewUser = await response.json();
  return result;
};

export const deleteUserApi = async (ids: User["id"][]): Promise<ApiResponseDeleteUser> => {
  const response = await fetch("/api/delete-user", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
    cache: "no-cache",
  });

  if (!response.ok) {
    const { error, alertMsg, rawText } = await readErrorBody(response);
    if (error) console.error(error);
    const err = new Error(error ?? alertMsg ?? rawText ?? "Request failed") as Error & {
      alertMsg?: string;
    };
    if (alertMsg) err.alertMsg = alertMsg;
    throw err;
  }

  const result: ApiResponseDeleteUser = await response.json();
  return result;
};

// 테스트
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

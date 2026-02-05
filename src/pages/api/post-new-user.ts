import { PayloadNewUser } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const parseBearerToken = (authorization?: string | string[]) => {
  if (typeof authorization !== "string") return null;

  const [scheme, token] = authorization.trim().split(/\s+/);
  console.log({ scheme, token });
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
};

// const hasAdminRole = (appMetadata: unknown) => {
//   if (!appMetadata || typeof appMetadata !== "object") return false;

//   const metadata = appMetadata as { role?: unknown; roles?: unknown };
//   const roles: string[] = [];

//   if (typeof metadata.role === "string") roles.push(metadata.role.toLowerCase());
//   if (Array.isArray(metadata.roles)) {
//     roles.push(
//       ...metadata.roles
//         .filter((role): role is string => typeof role === "string")
//         .map((role) => role.toLowerCase())
//     );
//   }

//   return roles.includes("admin");
// };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const accessToken = parseBearerToken(req.headers.authorization);
    if (!accessToken) {
      return res.status(401).json({
        error: "Unauthorized",
        alertMsg: "로그인이 필요합니다.",
      });
    }

    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({
        error: authError?.message ?? "Unauthorized",
        alertMsg: "로그인이 필요합니다.",
      });
    }

    // if (!hasAdminRole(authData.user.app_metadata)) {
    //   return res.status(403).json({
    //     error: "Forbidden",
    //     alertMsg: "관리자만 유저를 추가할 수 있습니다.",
    //   });
    // }

    // react-hook-form이 이미 name, email은 필수 입력으로 처리하고 있음
    const { name, phone, email, avatar }: PayloadNewUser = req.body;
    if (!name || !email) {
      return res.status(400).json({ alertMsg: "name, email은 필수 입력값입니다." });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ alertMsg: "유효한 이메일 형식이 아닙니다." });
    }

    const { data, error } = await supabaseServer
      .from("users")
      .insert({
        name,
        phone,
        email: email.trim(),
        avatar,
        author_id: authData.user.id,
      })
      .select()
      .single();

    // 이메일 중복 오류
    if (error?.code === "23505") {
      return res.status(409).json({
        error: error.message,
        alertMsg: `${email} 해당 이메일은 이미 사용 중인 이메일입니다.`,
      });
    }

    // Supabase insert 결과에서 실패가 났을 때 처리
    if (error || !data) {
      return res.status(500).json({
        error: error?.message ?? "Insert failed",
        alertMsg: "새로운 유저를 추가할 수 없습니다. 관리자에게 문의 부탁드립니다.",
      });
    }

    let revalidated = true;
    try {
      await res.revalidate("/");
    } catch (err) {
      console.error("revalidate failed", err);
      revalidated = false;
    }

    return res.status(200).json({ data, revalidated });
  } catch (e) {
    // 그 외 예상 못한 예외(코드 오류, 런타임 에러 등)를 잡는 안전망
    const error = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({
      error,
      alertMsg: "새로운 유저를 추가할 수 없습니다. 관리자에게 문의 부탁드립니다.",
    });
  }
}

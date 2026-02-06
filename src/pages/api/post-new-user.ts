import { PayloadNewUser } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// const parseBearerToken = (authorization?: string | string[]) => {
//   if (typeof authorization !== "string") return null;

//   const [scheme, token] = authorization.trim().split(/\s+/);
//   console.log({ scheme, token });
//   if (scheme?.toLowerCase() !== "bearer" || !token) return null;

//   return token;
// };

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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      error: "Method Not Allowed",
      alertMsg: "요청 방식이 올바르지 않습니다.",
    });
  }

  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    // const accessToken = parseBearerToken(req.headers.authorization);
    // if (!accessToken) {
    //   return res.status(401).json({
    //     error: "Unauthorized",
    //     alertMsg: "로그인이 필요합니다.",
    //   });
    // }

    // const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    // if (authError || !authData.user) {
    //   return res.status(401).json({
    //     error: authError?.message ?? "Unauthorized",
    //     alertMsg: "로그인이 필요합니다.",
    //   });
    // }

    // if (!hasAdminRole(authData.user.app_metadata)) {
    //   return res.status(403).json({
    //     error: "Forbidden",
    //     alertMsg: "관리자만 유저를 추가할 수 있습니다.",
    //   });
    // }

    const { name, phone, email, avatar }: PayloadNewUser = req.body;
    if (!name || !email) {
      console.error("post-new-user : name, email은 필수 입력값입니다.");
      return res.status(400).json({
        error: "Validation error",
        alertMsg: "name, email은 필수 입력값입니다.",
      });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      console.error("post-new-user : 유효한 이메일 형식이 아닙니다.");
      return res.status(400).json({
        error: "Validation error",
        alertMsg: "유효한 이메일 형식이 아닙니다.",
      });
    }

    const { data, error } = await supabaseServer
      .from("users")
      .insert({
        name,
        phone,
        email: email.trim(),
        avatar,
        // author_id: authData.user.id,
      })
      .select()
      .single();

    // 이메일 중복 오류
    if (error?.code === "23505") {
      console.error(`post-new-user : ${error.message}`);
      return res.status(409).json({
        error: error.message,
        alertMsg: `${email} 해당 이메일은\n이미 사용 중인 이메일입니다.`,
      });
    }

    // Supabase insert 결과에서 실패가 났을 때 처리
    if (error || !data) {
      throw new Error(error?.message ?? "Insert failed");
    }

    try {
      await res.revalidate("/");
    } catch (error) {
      console.error("post-new-user : revalidate failed", error);
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      alertMsg: "새로운 유저를 추가할 수 없습니다. 관리자에게 문의 부탁드립니다.",
    });
  }
}

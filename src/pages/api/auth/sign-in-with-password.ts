import { getSupabaseServer } from "@/lib/supabase.server";
import type { NextApiRequest, NextApiResponse } from "next";
import { EMAIL_PATTERN } from "@/constants";

const getLoginErrorMessage = (message?: string) => {
  const normalized = (message ?? "").toLowerCase();
  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "이메일 또는 비밀번호를 확인해주세요.";
  }
  if (normalized.includes("email not confirmed")) {
    return "이메일 인증 후 로그인해주세요.";
  }
  return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    if (!email || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "유효한 이메일 형식이 아닙니다." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "비밀번호는 8자 이상 입력해야 합니다." });
    }

    const { error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(error);
      return res.status(400).json({ message: getLoginErrorMessage(error.message) });
    }

    return res.status(200).json(true);
  } catch (err) {
    console.error("sign-in-with-password : request failed:", err);
    return res.status(500).json({ message: "로그인에 실패했습니다.\n잠시 후 다시 시도해주세요." });
  }
}

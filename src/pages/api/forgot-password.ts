import { getSupabaseServer } from "@/lib/supabase.server";
import type { NextApiRequest, NextApiResponse } from "next";
import { EMAIL_PATTERN } from "@/constants";
import { getBaseUrl } from "@/util";

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
    if (!email || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: "유효한 이메일 형식이 아닙니다." });
    }

    const redirectTo = `${getBaseUrl(req)}/login/reset`;
    const { error } = await supabaseServer.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw new Error(error.message);
    }

    return res
      .status(200)
      .json({ message: "입력하신 이메일로\n비밀번호 재설정 메일이 발송되었습니다." });
  } catch (err) {
    console.error("Forgot-password request failed:", err);
    return res.status(500).json({ message: "비밀번호 변경요청 실패했습니다.\n다시 시도해주세요." });
  }
}

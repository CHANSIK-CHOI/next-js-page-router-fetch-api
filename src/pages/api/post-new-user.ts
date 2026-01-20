import { PayloadNewUser } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";

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

    // react-hook-form이 이미 first_name, last_name, email은 필수 입력으로 처리하고 있음
    const { first_name, last_name, email, avatar }: PayloadNewUser = req.body;
    if (!first_name || !last_name || !email) {
      return res
        .status(400)
        .json({ alertMsg: "first name, last name, email은 필수 입력값입니다." });
    }

    const { data, error } = await supabaseServer
      .from("users")
      .insert({
        first_name,
        last_name,
        email,
        avatar,
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

    return res.status(200).json({ data });
  } catch (e) {
    // 그 외 예상 못한 예외(코드 오류, 런타임 에러 등)를 잡는 안전망
    const error = e instanceof Error ? e.message : "Unknown error";
    return res
      .status(500)
      .json({
        error,
        alertMsg: "새로운 유저를 추가할 수 없습니다. 관리자에게 문의 부탁드립니다.",
      });
  }
}

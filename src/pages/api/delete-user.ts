import { getSupabaseServer } from "@/lib/supabase.server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const ids = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Invalid ids",
        alertMsg: "삭제할 유저를 선택해주세요.",
      });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidId = ids.find((id) => typeof id !== "string" || !uuidRegex.test(id));
    if (invalidId) {
      return res.status(400).json({
        error: "Invalid id format",
        alertMsg: "유효하지 않은 유저 ID가 포함되어 있습니다.",
      });
    }

    const { error } = await supabaseServer.from("users").delete().in("id", ids);

    if (error) {
      return res.status(500).json({
        error: error?.message ?? "Delete failed",
        alertMsg: "선택한 유저를 삭제할 수 없습니다. 관리자에게 문의 부탁드립니다.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    // 그 외 예상 못한 예외(코드 오류, 런타임 에러 등)를 잡는 안전망
    const error = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({
      error,
      alertMsg: "선택한 유저를 삭제할 수 없습니다. 관리자에게 문의 부탁드립니다.",
    });
  }
}

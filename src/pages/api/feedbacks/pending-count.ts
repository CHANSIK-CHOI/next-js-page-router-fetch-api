import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { SupabaseError, UserRole } from "@/types";
import { getAccessToken } from "@/util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ count: null, error: "Method Not Allowed" });
  }

  const supabaseServer = getSupabaseServer();
  if (!supabaseServer) {
    return res
      .status(500)
      .json({ count: null, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({ count: null, error: "Missing access token" });
  }

  try {
    const { data: authData, error: authError } = await supabaseServer.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return res.status(401).json({ count: null, error: authError?.message ?? "Unauthorized" });
    }

    const {
      data: roleData,
      error: roleError,
    }: { data: Pick<UserRole, "user_id" | "role"> | null; error: SupabaseError } =
      await supabaseServer
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", authData.user.id)
        .maybeSingle();
    if (roleError || !roleData?.role) {
      return res
        .status(401)
        .json({ role: null, error: roleError?.message ?? "Select failed Role Data" });
    }

    if (!roleData || roleData.role !== "admin") {
      return res.status(403).json({ count: null, error: "Forbidden" });
    }

    // status = 'pending' | 'revised_pending' 개수만 조회
    const { count, error: countError } = await supabaseServer
      .from("feedbacks")
      .select("id", { count: "exact", head: true })
      // 데이터는 가져오지 않고 “개수만” 세기 위한 Supabase 쿼리 옵션
      // select("id"): 카운트 기준 컬럼 지정 (여기선 id)
      // count: "exact": 정확한 개수를 계산
      // head: true: 실제 row 데이터는 내려받지 않음 (헤더만)
      .in("status", ["pending", "revised_pending"]);

    if (countError || count === null) {
      return res
        .status(401)
        .json({ count: null, error: countError?.message ?? "Select failed Pending Data Count" });
    }

    return res.status(200).json({ count, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ count: null, error: message });
  }
}

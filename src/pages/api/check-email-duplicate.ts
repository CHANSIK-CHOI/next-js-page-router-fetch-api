import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const { email } = req.body as { email?: string };
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const { data, error } = await supabaseServer
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ exists: !!data });
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({
      error,
      alertMsg: "이메일 중복 여부를 확인할 수 없습니다.",
    });
  }
}

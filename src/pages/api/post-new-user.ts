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

    const { first_name, last_name, email, avatar }: PayloadNewUser = req.body;

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

    if (error || !data) {
      return res.status(500).json({ error: error?.message ?? "Insert failed" });
    }

    return res.status(200).json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}

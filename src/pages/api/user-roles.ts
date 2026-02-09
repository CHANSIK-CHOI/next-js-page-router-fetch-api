import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabase.server";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import { UserRole } from "@/types";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const supabaseServer = getSupabaseServer();
    if (!supabaseServer) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const session: Session | null = req.body;
    if (!session) throw new Error("Session is Null");

    const { data: authData, error: authError } = await supabaseServer.auth.getUser(
      session.access_token
    );
    if (authError || !authData.user) {
      throw new Error(authError?.message);
    }

    const { data, error }: { data: UserRole[] | null; error: PostgrestError | null } =
      await supabaseServer
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "reviewer",
        })
        .select();

    if (error || !data) {
      throw new Error(error?.message ?? "Insert failed");
    }

    return res.status(200).json(true);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(message);
    return res.status(500).json(false);
  }
}

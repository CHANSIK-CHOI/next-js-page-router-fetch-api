import type { NextApiRequest, NextApiResponse } from "next";
import type { PayloadModifiedUser } from "@/types";

const BASE_URL = process.env.USER_SECRET_API_URL;
const API_KEY = process.env.USER_SECRET_API_KEY;

function requireEnv(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const base = requireEnv(BASE_URL, "USER_SECRET_API_URL");
    const key = requireEnv(API_KEY, "USER_SECRET_API_KEY");
    const id = req.query.id;

    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    // PATCH /api/users/:id
    if (req.method === "PATCH") {
      const payload = req.body as PayloadModifiedUser;

      const r = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "x-api-key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await r.text();
      res.status(r.status).send(text);
      return;
    }

    // DELETE /api/users/:id
    if (req.method === "DELETE") {
      const r = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-api-key": key },
      });

      // 204면 바디 없을 수 있으니 그대로 처리
      res.status(r.status).end();
      return;
    }

    res.setHeader("Allow", ["PATCH", "DELETE"]);
    res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}

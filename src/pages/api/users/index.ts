// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { PayloadNewUser, User } from "@/types";

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

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { first_name, last_name, email, avatar } = req.body as {
      first_name?: User["first_name"];
      last_name?: User["last_name"];
      email?: User["email"];
      avatar?: string; // ✅ public url 저장
    };

    if (!first_name || !last_name || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const payload: PayloadNewUser = {
      first_name,
      last_name,
      email,
      avatar: avatar ?? "", // 또는 optional 처리
    };

    const r = await fetch(`${base}/users`, {
      method: "POST",
      headers: { "x-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}

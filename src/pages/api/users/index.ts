import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { type File as FormidableFile } from "formidable";
import fs from "node:fs/promises";
import type { PayloadNewUser, User } from "@/types";

// src/pages/api/users/index.ts
export const config = {
  api: {
    bodyParser: false, // ✅ multipart 받기 위해 끔
  },
};

const BASE_URL = process.env.USER_SECRET_API_URL;
const API_KEY = process.env.USER_SECRET_API_KEY;

function requireEnv(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function parseForm(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  return new Promise<{
    fields: {
      first_name?: User["first_name"];
      last_name?: User["last_name"];
      email?: User["email"];
    };
    files: { avatar?: FormidableFile };
  }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      const pick = (v: unknown) =>
        Array.isArray(v)
          ? typeof v[0] === "string"
            ? v[0]
            : undefined
          : typeof v === "string"
            ? v
            : undefined;

      const avatar = files.avatar;
      const avatarFile = Array.isArray(avatar) ? avatar[0] : (avatar as FormidableFile | undefined);

      resolve({
        fields: {
          first_name: pick(fields.first_name),
          last_name: pick(fields.last_name),
          email: pick(fields.email),
        },
        files: { avatar: avatarFile },
      });
    });
  });
}

function toDataUrlBase64(buf: Buffer, mime: string) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

/*
handler: 이게 “프록시 API 엔드포인트”
이 함수는 /api/users로 들어온 모든 요청을 받음.
처음 들어오자마자 env가 존재하는지 확인하고(requireEnv) 없으면 catch로 넘어가 500 내려줌.
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 여기서 “서버 컨텍스트에서만 비밀을 쓸 수 있다”가 코드로 강제돼.
    const base = requireEnv(BASE_URL, "USER_SECRET_API_URL");
    const key = requireEnv(API_KEY, "USER_SECRET_API_KEY");

    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }
    /*
      [지원하지 않는 메서드 처리]
      Allow 헤더 + 405
      /api/users는 POST만 허용한다는 의미.
      PUT/PATCH/DELETE로 치면 405로 막아줌.
      표준적인 REST 처리 방식.
    */

    const { fields, files } = await parseForm(req);

    if (!fields.first_name || !fields.last_name || !fields.email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    let avatarBase64 = "";

    if (files.avatar) {
      // formidable v2/v3에서 filepath/mimetype 속성
      const filepath = (files.avatar as FormidableFile).filepath as string | undefined;
      const mimetype = (files.avatar as FormidableFile).mimetype as string | undefined;

      if (filepath && mimetype) {
        const buf = await fs.readFile(filepath);
        avatarBase64 = toDataUrlBase64(buf, mimetype);

        // 임시파일 삭제(권장)
        try {
          await fs.unlink(filepath);
        } catch {}
      }
    }

    const payload: PayloadNewUser = {
      first_name: fields.first_name,
      last_name: fields.last_name,
      email: fields.email,
      avatar: avatarBase64, // ✅ 외부 API가 base64(DataURL) 기대
    };

    const r = await fetch(`${base}/users`, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    /*
      [외부 API로 POST 전달 + 키 + JSON]
      클라이언트가 보내준 payload를 그대로 외부 API로 전달.
      중요한 점: 키는 서버만 붙임. 클라이언트는 모름.
    */

    const text = await r.text();
    res.status(r.status).send(text);
    /*
      [응답 전달]
      GET과 똑같이 “상태 코드 + 바디 그대로 전달”
    */
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
    /*
      여기서 터지는 대표 케이스:
      env가 없을 때 (Missing env: ...)
      fetch 자체가 네트워크 실패할 때
      코드 내부 예외
    */
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { type File as FormidableFile } from "formidable";
import fs from "node:fs/promises";
import type { PayloadNewUser, User } from "@/types";

// src/pages/api/users/index.ts
export const config = {
  api: {
    bodyParser: false,
    /*
    1) 왜 bodyParser: false가 필수야?
      Next.js API Routes의 기본 bodyParser는 req 스트림을 미리 읽어서 JSON/텍스트로 만들어버려.
      그런데 multipart/form-data(파일 업로드)는 스트리밍으로 파싱해야 하고, formidable은 req 스트림을 직접 읽어야 함.
      즉,
        - Next bodyParser가 먼저 읽어버리면 → req 스트림이 이미 소모됨(EOF)
        - formidable은 읽을 게 없음 → 파싱 실패
      이게 Node의 스트림(Readable) 특성이고, “한 번 읽은 body는 되돌릴 수 없다”는 점이 핵심이야.
    */

    /*
      [스트림(Stream)]
      데이터를 한 번에 통째로 다루지 않고, “조각(chunk)” 단위로 흐르게(읽고/쓰게) 하는 인터페이스/객체.
      Node에서 req는 Readable Stream (요청 바디가 흘러 들어옴)
      파일에 쓰는 건 Writable Stream (_writeStream)
      즉, **스트림은 ‘도구(객체/추상화)’**야.
    */

    /*
      [스트리밍(Streaming)]
      스트림을 이용해서 데이터를 조각조각 처리하는 방식/패턴(행위).
      “업로드를 받는 동시에 디스크에 써버리기”
      “다운로드를 받는 동시에 클라이언트로 바로 흘려보내기”
      “전체를 메모리에 올리기 전에 처리하기”
      즉, **스트리밍은 ‘일하는 방식(처리 전략)’**이야.
    */

    /* formidable이 req 스트림을 스트리밍으로 파싱해서 _writeStream으로 디스크에 저장한 것. */
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
    multiples: false, // 같은 필드명으로 여러 파일이 와도 “배열로 받지 않겠다” 쪽에 가까운 옵션이지만, 실제로 files.avatar 타입은 상황에 따라 배열일 수도 있어서 너도 방어코드(Array.isArray)를 둔 거야.
    maxFileSize: 10 * 1024 * 1024, // 개별 파일 최대 크기 제한 : 10MB
    keepExtensions: true, // 임시파일 저장할 때 원래 확장자를 유지
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
      /*
        [form.parse(req, cb) 호출]
        여기서 formidable은:
        req 스트림을 읽으면서 multipart boundary를 기준으로 “파트(part)”를 쪼갬
        텍스트 파트는 fields로 모으고
        파일 파트는 서버 디스크에 임시파일로 쓰고, 그 결과 메타 정보를 files에 넣어줌
        중요: formidable은 파일을 “메모리에 통째로 올리는 게 아니라”, 기본 동작은 디스크로 스트리밍 저장이야. 
        그래서 너 코드가 fs.readFile(filepath)로 다시 읽고 있지.
      */

      /*
        [multipart boundary]
        multipart/form-data는 “폼 데이터가 여러 파트(part)로 묶여 있음”을 의미해.
        텍스트 필드도 있고, 파일도 있고.
        이때 서버는 “어디서부터 어디까지가 한 파트인지”를 알아야 하잖아?
        그 경계선을 표시하는 문자열이 boundary야.
        즉 boundary는:
        파트를 나누는 구분자
        formidable 같은 multipart 파서가 이 boundary를 기준으로 “필드 파트/파일 파트”를 분해함
      */
      if (err) return reject(err);

      console.log("parseForm fields : ", fields);
      console.log("parseForm files : ", files);

      const pick = (v: unknown) =>
        Array.isArray(v)
          ? typeof v[0] === "string"
            ? v[0]
            : undefined
          : typeof v === "string"
            ? v
            : undefined;
      /*
      [pick() 함수의 의미 (fields가 왜 이상하게 생기냐?)]
      formidable은 필드가 상황에 따라:
      "abc" 같은 string일 수도 있고
      ["abc"] 같은 배열일 수도 있어(특히 동일 name이 여러 번 오면)
      그래서 너는 “항상 string 하나만 받고 싶다”는 의도로:
      */

      const avatar = files.avatar;
      const avatarFile = Array.isArray(avatar) ? avatar[0] : avatar;
      /*
      [files.avatar에서 배열 체크를 하는 이유]
      multiples:false여도 클라이언트가 multiple로 보내거나, 라이브러리/타입 정의 차이 때문에 files.avatar가 배열일 수 있어.
      그래서 “일단 첫 번째 파일만 쓰겠다”는 방어 로직.
      */

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

    console.log("return fields : ", fields);
    console.log("return files : ", files);

    if (!fields.first_name || !fields.last_name || !fields.email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    let avatarBase64 = "";

    /* 
    “formidable이 디스크에 임시로 저장해둔 파일을 filepath로 찾아가서 읽고, base64로 바꾼 뒤, 임시파일을 삭제한다”
    
    1) 왜 filepath를 읽어?
    formidable은 파일 업로드를 파싱할 때 파일을 임시 경로에 저장해.
    그 임시 경로가 바로 file.filepath야.
    즉 files.avatar는 파일 “내용”이 아니라, 파일에 대한 “설명서(메타데이터)” 객체고,
    실제 내용은 디스크에 있음.
    */
    if (files.avatar) {
      const filepath = files.avatar.filepath;
      /* filepath : “실제 파일이 저장된 위치”를 얻고, */
      const mimetype = files.avatar.mimetype;
      /*
      mimetype : 왜 mimetype가 필요해?
      너는 base64를 만들 때 Data URL 포맷을 쓰고 있어: 
      data:${mime};base64,....
      여기서 mime이 없으면 data:;base64,...처럼 돼서
      브라우저/서버가 이게 png인지 jpeg인지 판단하기 어려워져.
      그래서 formidable이 파싱해준 file.mimetype 를 같이 쓰는 거야.
      */

      if (filepath && mimetype) {
        const buf = await fs.readFile(filepath);
        /* buf : filepath로 파일 내용을 Buffer로 읽는 거야.*/
        avatarBase64 = toDataUrlBase64(buf, mimetype);
        /*
        avatarBase64 : 왜 굳이 base64(DataURL)로 바꿔?
        즉, 외부 API가 “파일 업로드”를 받는 게 아니라
        “문자열로 된 이미지(DataURL)”를 받기 때문에 너가 변환하는 것.
        */

        try {
          await fs.unlink(filepath);
          /*
          왜 임시파일을 삭제해?
          기본 uploadDir(지정 안 하면 os.tmpdir())에 파일이 쌓이면:
          서버 디스크가 계속 늘어남
          특히 서버리스/컨테이너 환경에서도 예기치 않게 용량 압박이 생김
          그래서 처리 끝나면:지우는 게 권장 패턴이야.
          */
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

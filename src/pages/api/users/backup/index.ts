import type { NextApiRequest, NextApiResponse } from "next";
import type { PayloadNewUser } from "@/types";

const BASE_URL = process.env.USER_SECRET_API_URL;
const API_KEY = process.env.USER_SECRET_API_KEY;

function requireEnv(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/*
handler: 이게 “프록시 API 엔드포인트”
이 함수는 /api/users로 들어온 모든 요청을 받음.
처음 들어오자마자 env가 존재하는지 확인하고(requireEnv) 없으면 catch로 넘어가 500 내려줌.
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("req ---> ", req);
    console.log("res ---> ", res);
    // 여기서 “서버 컨텍스트에서만 비밀을 쓸 수 있다”가 코드로 강제돼.
    const base = requireEnv(BASE_URL, "USER_SECRET_API_URL");
    const key = requireEnv(API_KEY, "USER_SECRET_API_KEY");

    // GET /api/users?page=1&per_page=12 또는 /api/users?id=... GET 호출하면 이 블록이 실행됨.
    if (req.method === "GET") {
      const qs = new URLSearchParams(req.query as Record<string, string>).toString();
      /*
        [querystring 만들기]
        req.query는 Next가 파싱해준 쿼리 객체.
        예: /api/users?page=1&per_page=12
        → req.query = { page: "1", per_page: "12" }

        URLSearchParams는 이 객체를 다시
        "page=1&per_page=12" 같은 문자열로 만들어줌.
      */
      const url = qs ? `${base}/users?${qs}` : `${base}/users`;
      /*
        그리고 최종 외부 API URL은:
        ${base}/users?page=1&per_page=12
        즉 여기서 “프록시”가 하는 일이 명확해져:
        클라이언트 쿼리를 그대로 외부 API에 전달해주는 중계기 역할.
      */

      const r = await fetch(url, { headers: { "x-api-key": key } });
      const text = await r.text();
      /*
        “한 번 더 fetch 하는 게 아니라, ‘역할이 다른 fetch 두 개’다.”
        공용 유틸의 fetch 👉 브라우저 → 내 서버
        프록시의 fetch 👉 내 서버 → 외부 API
        이 둘은 같은 fetch가 아니다.

        fetch는 “행위”가 아니라 “위치”가 중요하다
        fetch 자체는 그냥 HTTP 요청이야.    
        누가 실행하느냐(실행 컨텍스트) 가 전부다.

        이 fetch의 의미
        실행 위치: Next 서버
        목적: 외부 API 호출
        특징:
        API KEY 포함
        실제 데이터 소스 접근
        👉 이건 “백엔드 → 외부 서비스” 통신이야.
      */

      console.log("r ---> ", r, "text ---> ", text);
      /*
        [외부 API 호출 + 키 붙이기]
        외부 API는 x-api-key 헤더가 필요하니까 서버가 붙여서 호출.
        응답을 json()이 아니라 text()로 읽는 이유:  
        외부 API가 항상 JSON을 준다고 확신할 수 없을 때
        또는 그대로 전달(pass-through) 하고 싶을 때
        에러 바디도 그대로 전달 가능
      */

      res.status(r.status).send(text);
      /*
        [상태코드 그대로 전달]
        외부 API가 200이면 200
        외부 API가 401이면 401
        외부 API가 500이면 500
        그대로 내 API에서도 유지.
        이게 좋은 이유:
        클라이언트가 실제 실패를 정확히 감지할 수 있음.
        “프록시가 억지로 다 200으로 바꾸는” 실수 방지.
      */

      return;
    }

    // POST /api/users
    if (req.method === "POST") {
      const payload = req.body as PayloadNewUser;
      /*
        /api/users에 POST 요청이 오면 body를 읽는다.
        여기서 주의: as PayloadNewUser는 타입 주장이지 검증이 아님.
        잘못된 형태가 들어와도 런타임 에러는 여기서 안 남.
        외부 API가 대신 검증하고 에러를 줄 가능성이 큼.
      */

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
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    /*
      [지원하지 않는 메서드 처리]
      Allow 헤더 + 405
      /api/users는 GET/POST만 허용한다는 의미.
      PUT/PATCH/DELETE로 치면 405로 막아줌.
      표준적인 REST 처리 방식.
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

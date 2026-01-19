import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await res.revalidate("/");
    // Next.js의 revalidate 메서드로 / 경로의 ISR 캐시를 무효화함
    // 목록 페이지(/)를 다음 요청 때 다시 생성하게 만드는 트리거
    return res.json({ revalidate: true });
  } catch (err) {
    res.status(500).send(`revalidate failed ${err}`);
  }
}

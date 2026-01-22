import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!expectedSecret || secret !== expectedSecret) {
    console.log("캐시 무효화 실패");
    return res.status(401).json({ message: "Invalid secret" });
  }

  try {
    await res.revalidate("/");
    // Next.js의 revalidate 메서드로 / 경로의 ISR 캐시를 무효화함
    // 목록 페이지(/)를 다음 요청 때 다시 생성하게 만드는 트리거
    return res.json({ revalidate: true });
  } catch (err) {
    res.status(500).send(`revalidate failed ${err}`);
  }
}

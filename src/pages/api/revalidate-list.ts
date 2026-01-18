import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await res.revalidate("/");
    // res 객체의 revalidate 메서드로 index 페이지의 경로를 연결
    return res.json({ revalidate: true });
    // 요청이 성공하면 revalidate 를 true 로 응답을 해준다.
  } catch (err) {
    res.status(500).send(`revalidate failed ${err}`);
    // res 객체의 status 를 500번으로 실패했다는 것을 알리고 응답으로 보낼 메시지를 보낸다.
  }
}
// api의 revalidate로 접속 요청하게 되면 handler가 실행된다.
// res.revalidate('/'); 로 인수로 전달한 index 경로를 다시 생성한다.
// 페이지에 재생성이 성동했다면 revalidate: true 라는 응답이 돌아오게 된다.

// 새로운 탭을 열고 http://localhost:3000/api/revalidate 로 요청을 보내보면 {"revalidate":true} 출력이 되면서 데이터가 변화하는것을 볼 수 있다.

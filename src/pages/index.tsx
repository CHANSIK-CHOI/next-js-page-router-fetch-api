import classNames from "classnames/bind";
import styles from "./index.module.scss";
import UserBox from "@/components/UserBox";
import users from "@/mock/users.json";
import Link from "next/link";
import { getUserApi } from "@/lib/users.server";
import { InferGetStaticPropsType } from "next";
import { User } from "@/types";
const cx = classNames.bind(styles);

export const getStaticProps = async () => {
  const { data: allUsers } = await getUserApi<User[]>();
  return {
    props: { allUsers },
  };
};

export default function UserList({ allUsers }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!allUsers) return <div>Loading ...</div>;

  return (
    <div className={cx("userList")}>
      <div className={cx("userList__head")}>
        <div className={cx("userList__title")}>
          <span className={cx("userList__result")}>검색 결과 : {allUsers.length}건</span>
        </div>

        <div className={cx("userList__actions")}>
          {/* 삭제하기 */}
          <button type="button" className="btn btn--line">
            삭제할 유저 선택하기
          </button>
          <button type="button" className="btn btn--line">
            선택취소
          </button>
          <button type="button" className="btn btn--line">
            전체취소
          </button>
          <button type="button" className="btn btn--solid">
            전체선택
          </button>
          <button type="button" className="btn btn--solid btn--danger">
            삭제하기
          </button>

          {/* 추가하기 */}
          <Link href={`users/new`} className="btn btn--solid btn--warm">
            새 유저 추가
          </Link>

          {/* 전체수정 */}
          {/* <Link href={`users/bulk-edit`} className="btn btn--line">전체 유저 정보 수정</Link> */}
        </div>
      </div>

      <div className={cx("userList__body")}>
        <ul className={cx("userList__list")}>
          {allUsers?.map((user) => (
            <li key={user.id} className={cx("userList__item")}>
              <UserBox {...user} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

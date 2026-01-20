import classNames from "classnames/bind";
import styles from "./index.module.scss";
import UserBox from "@/components/UserBox";
import Link from "next/link";
import { getUserApi } from "@/lib/users.server";
import { InferGetStaticPropsType } from "next";
import { User, isErrorAlertMsg } from "@/types";
import { useEffect, useMemo, useReducer } from "react";
import { useRouter } from "next/router";
import { INIT_USER_DELETE_STATE, userDeleteReducer } from "@/reducer";
import { deleteUserApi } from "@/lib/users.client";
const cx = classNames.bind(styles);

export const getStaticProps = async () => {
  try {
    const { data: allUsers } = await getUserApi<User[]>();
    return {
      props: { allUsers },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;

    return { props: { allUsers: [], userMessage } };
  }
};

export default function UserList({
  allUsers,
  userMessage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE
  );
  const targetIds = useMemo(() => allUsers.map((u) => u.id), [allUsers]);

  useEffect(() => {
    if (userMessage) {
      console.error(userMessage);
      alert(userMessage);
    }
  }, [userMessage]);

  if (!allUsers) return <div>Loading ...</div>;

  const isAllChecked = allUsers.length > 0 && userDeleteState.checkedIds.length === allUsers.length;

  const handleDeleteCheckedItem = async () => {
    if (userDeleteState.checkedIds.length === 0) {
      alert("선택한 데이터가 없습니다.");
      return;
    }

    if (userDeleteState.deleteing) return;

    const targetUsers = allUsers.filter(({ id }) => userDeleteState.checkedIds.includes(id));
    const targetUsersnames = targetUsers.map((u) => `${u.first_name} ${u.last_name}`).join(", ");

    const confirmMsg = `${targetUsersnames} 유저들을 삭제하시겠습니까?`;
    if (!confirm(confirmMsg)) return;

    try {
      userDeleteDispatch({ type: "SUBMIT_CHECKED_ITEMS_START" });
      await deleteUserApi(userDeleteState.checkedIds);
      userDeleteDispatch({ type: "SUBMIT_SUCCESS" });
      alert("삭제를 완료하였습니다.");
      await fetch("/api/revalidate-list"); // 캐시 무효화
      await router.replace(router.asPath); // 새 요청 트리거
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const userMessage = isErrorAlertMsg(err) && err.alertMsg ? err.alertMsg : message;
      console.error(err);
      alert(userMessage);
      userDeleteDispatch({
        type: "SUBMIT_ERROR",
      });
    }
  };

  return (
    <div className={cx("userList")}>
      <div className={cx("userList__head")}>
        <div className={cx("userList__title")}>
          <span className={cx("userList__result")}>검색 결과 : {allUsers.length}건</span>
        </div>

        <div className={cx("userList__actions")}>
          {/* 삭제하기 */}
          {!userDeleteState.isShowDeleteCheckbox ? (
            <button
              type="button"
              className="btn btn--line"
              onClick={() => userDeleteDispatch({ type: "SHOW_CHECKBOX" })}
            >
              삭제할 유저 선택하기
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--line"
                onClick={() => userDeleteDispatch({ type: "HIDE_CHECKBOX" })}
              >
                선택취소
              </button>
              {isAllChecked ? (
                <button
                  type="button"
                  className="btn btn--line"
                  onClick={() => userDeleteDispatch({ type: "RESET_CHECKED" })}
                >
                  전체취소
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--solid"
                  onClick={() =>
                    userDeleteDispatch({ type: "ALL_CHECKED", payload: { ids: targetIds } })
                  }
                >
                  전체선택
                </button>
              )}

              <button
                type="button"
                className="btn btn--solid btn--danger"
                disabled={userDeleteState.deleteing}
                onClick={handleDeleteCheckedItem}
              >
                {userDeleteState.deleteing ? "삭제중..." : "삭제하기"}
              </button>
            </>
          )}

          {/* 추가하기 */}
          {!userDeleteState.isShowDeleteCheckbox && (
            <Link href={`users/new`} className="btn btn--solid btn--warm">
              새 유저 추가
            </Link>
          )}

          {/* 전체수정 */}
          {/* <Link href={`users/bulk-edit`} className="btn btn--line">전체 유저 정보 수정</Link> */}
        </div>
      </div>

      <div className={cx("userList__body")}>
        <ul className={cx("userList__list")}>
          {allUsers?.map((user) => (
            <li key={user.id} className={cx("userList__item")}>
              <UserBox
                {...user}
                deleteState={userDeleteState}
                deleteDispatch={userDeleteDispatch}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

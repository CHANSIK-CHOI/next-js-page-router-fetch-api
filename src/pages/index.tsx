import classNames from "classnames/bind";
import styles from "./index.module.scss";
import UserBox from "@/components/UserBox";
import Link from "next/link";
import { getUserApi } from "@/lib/users.server";
import { InferGetStaticPropsType } from "next";
import { User, isErrorAlertMsg } from "@/types";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
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
  const [sortOption, setSortOption] = useState("latest");
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE
  );
  const targetIds = useMemo(() => allUsers.map((u) => u.id), [allUsers]);
  const sortedUsers = useMemo(() => {
    const users = [...allUsers];
    /*
      sort()
      - 음수를 리턴하면 a가 b보다 앞으로
      - 양수를 리턴하면 a가 b보다 뒤로
      - 0이면 순서 유지
    */
    if (sortOption === "nameAsc") {
      return users.sort((leftUser, rightUser) => {
        const leftName = `${leftUser.last_name} ${leftUser.first_name}`.trim();
        const rightName = `${rightUser.last_name} ${rightUser.first_name}`.trim();
        return leftName.localeCompare(rightName);
      });
    }
    if (sortOption === "nameDesc") {
      return users.sort((leftUser, rightUser) => {
        const leftName = `${leftUser.last_name} ${leftUser.first_name}`.trim();
        const rightName = `${rightUser.last_name} ${rightUser.first_name}`.trim();
        return rightName.localeCompare(leftName);
      });
    }
    if (sortOption === "oldest") {
      return users.sort((leftUser, rightUser) => {
        const leftTime = leftUser.created_at ? new Date(leftUser.created_at).getTime() : 0;
        const rightTime = rightUser.created_at ? new Date(rightUser.created_at).getTime() : 0;
        return leftTime - rightTime;
      });
    }
    return users.sort((leftUser, rightUser) => {
      const leftTime = leftUser.created_at ? new Date(leftUser.created_at).getTime() : 0;
      const rightTime = rightUser.created_at ? new Date(rightUser.created_at).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [allUsers, sortOption]);
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    if (userMessage && !hasAlertedRef.current) {
      console.error(userMessage);
      alert(userMessage);
      hasAlertedRef.current = true;
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
      const result = await deleteUserApi(userDeleteState.checkedIds);
      console.log(result);
      userDeleteDispatch({ type: "SUBMIT_SUCCESS" });
      alert("삭제를 완료하였습니다.");
      await router.replace(router.asPath, undefined, { unstable_skipClientCache: true });
      // 캐시 갱신: 서버에 저장된 정적 페이지를 “다음 요청 때 새로 만들게” 하는 것 (지금 보고 있는 화면은 그대로)
      // UI 즉시 반영: 사용자가 보고 있는 화면의 상태를 바로 바꾸는 것 (라우터로 새 요청하거나, 로컬 상태 업데이트)
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
          <label className={cx("userList__sort")}>
            <span className={cx("userList__sortLabel")}>정렬</span>
            <select
              className={cx("userList__select")}
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="latest">최신 등록 순</option>
              <option value="oldest">오래된 등록 순</option>
              <option value="nameAsc">이름 오름차순</option>
              <option value="nameDesc">이름 내림차순</option>
            </select>
          </label>
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
          {sortedUsers?.map((user) => (
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

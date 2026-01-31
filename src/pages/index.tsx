import UserBox from "@/components/UserBox";
import Link from "next/link";
import { getUserApi } from "@/lib/users.server";
import { InferGetStaticPropsType } from "next";
import { isErrorAlertMsg } from "@/types";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/router";
import { INIT_USER_DELETE_STATE, userDeleteReducer } from "@/reducer";
import { deleteUserApi } from "@/lib/users.client";
import { useAlert, Button, Select } from "@/components/ui";

export const getStaticProps = async () => {
  try {
    const { data: allUsers } = await getUserApi();
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
  const [users, setUsers] = useState(allUsers);
  const [sortOption, setSortOption] = useState("latest");
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE
  );
  const targetIds = useMemo(() => users.map((u) => u.id), [users]);
  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    /*
      sort()
      - 음수를 리턴하면 a가 b보다 앞으로
      - 양수를 리턴하면 a가 b보다 뒤로
      - 0이면 순서 유지
    */
    if (sortOption === "nameAsc") {
      return sorted.sort((leftUser, rightUser) => {
        const leftName = `${leftUser.last_name} ${leftUser.first_name}`.trim();
        const rightName = `${rightUser.last_name} ${rightUser.first_name}`.trim();
        return leftName.localeCompare(rightName);
      });
    }
    if (sortOption === "nameDesc") {
      return sorted.sort((leftUser, rightUser) => {
        const leftName = `${leftUser.last_name} ${leftUser.first_name}`.trim();
        const rightName = `${rightUser.last_name} ${rightUser.first_name}`.trim();
        return rightName.localeCompare(leftName);
      });
    }
    if (sortOption === "oldest") {
      return sorted.sort((leftUser, rightUser) => {
        const leftTime = leftUser.created_at ? new Date(leftUser.created_at).getTime() : 0;
        const rightTime = rightUser.created_at ? new Date(rightUser.created_at).getTime() : 0;
        return leftTime - rightTime;
      });
    }
    return sorted.sort((leftUser, rightUser) => {
      const leftTime = leftUser.created_at ? new Date(leftUser.created_at).getTime() : 0;
      const rightTime = rightUser.created_at ? new Date(rightUser.created_at).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [users, sortOption]);
  const hasAlertedRef = useRef(false);

  const { openAlert: openTestAlert } = useAlert();

  useEffect(() => {
    if (userMessage && !hasAlertedRef.current) {
      console.error(userMessage);
      alert(userMessage);
      hasAlertedRef.current = true;
    }
  }, [userMessage]);

  useEffect(() => {
    setUsers(allUsers);
  }, [allUsers]);

  if (!users) return <div>Loading ...</div>;

  const isAllChecked = users.length > 0 && userDeleteState.checkedIds.length === users.length;

  const handleDeleteCheckedItem = async () => {
    if (userDeleteState.checkedIds.length === 0) {
      // alert("선택한 데이터가 없습니다.");
      openTestAlert({
        description: "선택한 데이터가 없습니다.",
        onOk: () => console.log("onOk"),
        onMotionComplete: (isOpen) => console.log("onCloseComplete", isOpen),
      });
      return;
    }

    if (userDeleteState.deleteing) return;

    const targetUsers = users.filter(({ id }) => userDeleteState.checkedIds.includes(id));
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
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              검색 결과 : {users.length}건
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-sm font-semibold">정렬</span>
              <Select defaultValue="latest" onValueChange={setSortOption}>
                <Select.Trigger className="w-[180px]">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="latest">최신 등록 순</Select.Item>
                  <Select.Item value="oldest">오래된 등록 순</Select.Item>
                  <Select.Item value="nameAsc">이름 오름차순</Select.Item>
                  <Select.Item value="nameDesc">이름 내림차순</Select.Item>
                </Select.Content>
              </Select>
            </label>

            {!userDeleteState.isShowDeleteCheckbox ? (
              <Button
                variant="outline"
                onClick={() => userDeleteDispatch({ type: "SHOW_CHECKBOX" })}
              >
                삭제할 유저 선택하기
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => userDeleteDispatch({ type: "HIDE_CHECKBOX" })}
                >
                  선택취소
                </Button>
                {isAllChecked ? (
                  <Button
                    variant="outline"
                    onClick={() => userDeleteDispatch({ type: "RESET_CHECKED" })}
                  >
                    전체취소
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      userDeleteDispatch({ type: "ALL_CHECKED", payload: { ids: targetIds } })
                    }
                  >
                    전체선택
                  </Button>
                )}

                <Button
                  variant="destructive"
                  disabled={userDeleteState.deleteing}
                  onClick={handleDeleteCheckedItem}
                >
                  {userDeleteState.deleteing ? "삭제중..." : "삭제하기"}
                </Button>
              </>
            )}

            {!userDeleteState.isShowDeleteCheckbox && (
              <Button
                asChild
                className="bg-[linear-gradient(135deg,#f5f5f5,#d4d4d4)] text-neutral-900 hover:opacity-90"
              >
                <Link href={`users/new`}>새 유저 추가</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <ul className="grid auto-rows-fr list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {sortedUsers?.map((user) => (
              <li key={user.id} className="h-full">
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
      {/* <Alert title="test" description="test" open /> */}
    </>
  );
}

import React, { Dispatch } from "react";
import type { User } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { UserDeleteAction, UserDeleteState } from "@/reducer";

type UserBoxProps = {
  avatar?: User["avatar"];
  first_name: User["first_name"];
  last_name: User["last_name"];
  email: User["email"];
  id: User["id"];
  deleteState: UserDeleteState;
  deleteDispatch: Dispatch<UserDeleteAction>;
};

export default function UserBox({
  avatar,
  first_name,
  last_name,
  email,
  id,
  deleteState,
  deleteDispatch,
}: UserBoxProps) {
  const isChecked = deleteState.checkedIds.includes(id);

  return (
    <div className="flex h-full items-center gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60">
      {deleteState.isShowDeleteCheckbox && (
        <div className="flex w-6 shrink-0 items-center justify-end sm:justify-start">
          <input
            type="checkbox"
            name={`checkbox_${id}`}
            id={`checkbox_${id}`}
            checked={isChecked}
            onChange={() => deleteDispatch({ type: "TOGGLE_ITEM", payload: { id } })}
            className="h-4 w-4 accent-primary"
          />
        </div>
      )}

      <Link href={`/users/${id}`} className="flex-1 text-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted dark:border-white/10">
            <Image
              src={avatar || PLACEHOLDER_SRC}
              alt={`${first_name} ${last_name}의 프로필`}
              width={120}
              height={120}
              unoptimized={!avatar}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex flex-col gap-1">
            <span className="whitespace-normal break-words text-base font-semibold">
              {first_name} {last_name}
            </span>
            <span className="whitespace-normal break-all text-sm text-muted-foreground">
              {email}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

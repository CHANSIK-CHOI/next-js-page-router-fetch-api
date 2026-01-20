import React, { Dispatch } from "react";
import styles from "./user.module.scss";
import classNames from "classnames/bind";
import type { User } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
import { UserDeleteAction, UserDeleteState } from "@/reducer";
const cx = classNames.bind(styles);

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
    <div className={cx("userBox")}>
      {deleteState.isShowDeleteCheckbox && (
        <div className={cx("userBox__checkbox")}>
          <input
            type="checkbox"
            name={`checkbox_${id}`}
            id={`checkbox_${id}`}
            checked={isChecked}
            onChange={() => deleteDispatch({ type: "TOGGLE_ITEM", payload: { id } })}
          />
        </div>
      )}

      <Link href={`/users/${id}`} className={cx("userBox__link")}>
        <div className={cx("userBox__box")}>
          <div className={cx("userBox__info")}>
            <div className={cx("userBox__profile")}>
              <div className={cx("userBox__profileView")}>
                <Image
                  src={avatar || PLACEHOLDER_SRC}
                  alt=""
                  width={120}
                  height={120}
                  unoptimized={!avatar}
                />
              </div>
            </div>

            <div className={cx("userBox__texts")}>
              <span className={cx("userBox__name")}>
                {first_name} {last_name}
              </span>
              <span className={cx("userBox__email")}>{email}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

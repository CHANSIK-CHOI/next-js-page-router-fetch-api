import React from "react";
import styles from "./user.module.scss";
import classNames from "classnames/bind";
import type { User } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_SRC } from "@/constants";
const cx = classNames.bind(styles);

type UserBoxProps = {
  avatar?: User["avatar"];
  first_name: User["first_name"];
  last_name: User["last_name"];
  email: User["email"];
  id: User["id"];
};
export default function UserBox({ avatar, first_name, last_name, email, id }: UserBoxProps) {
  return (
    <div className={cx("userBox")}>
      <Link href={`/users/${id}`} className={cx("userBox__link")}>
        <div className={cx("userBox__box")}>
          <div className={cx("userBox__info")}>
            <div className="userBox__profile">
              <div className="userBox__profileView">
                <Image src={avatar || PLACEHOLDER_SRC} alt="" width={120} height={120} />
              </div>
            </div>

            <div className="userBox__texts">
              <span className="userBox__name">
                {first_name} {last_name}
              </span>
              <span className="userBox__email">{email}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

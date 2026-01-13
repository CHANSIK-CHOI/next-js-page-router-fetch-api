import { getAllUsersApi } from "@/lib/users.api";
import { InferGetStaticPropsType } from "next";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import UserBox from "@/components/UserBox";
const cx = classNames.bind(styles);

export const getStaticProps = async () => {
  const { data } = await getAllUsersApi();

  return {
    props: {
      data,
    },
  };
};

export default function Home({ data }: InferGetStaticPropsType<typeof getStaticProps>) {
  console.log(data);
  return (
    <div className={cx("home")}>
      <ul className={cx("home__list")}>
        {data?.map((user) => (
          <li key={user.id} className={cx("home__item")}>
            <UserBox {...user} />
          </li>
        ))}
      </ul>
    </div>
  );
}

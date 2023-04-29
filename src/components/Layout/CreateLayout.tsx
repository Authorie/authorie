import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import { useState } from "react";

type tab = "book" | "chapter";

const CreateLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [tab, setTab] = useState(router.pathname.split("/")[2]);
  const onClickTabHandler = (selectedTab: tab) => {
    setTab(selectedTab);
    void router.push(`/create/${selectedTab}`);
  };

  const buttonClassName = (selectedTab: tab) => {
    if (selectedTab === tab) {
      return "rounded-t-2xl bg-white px-4 outline-none font-bold text-authGreen-600";
    } else {
      return "rounded-t-2xl bg-authGreen-600 outline-none px-4 text-white hover:bg-authGreen-500";
    }
  };

  return (
    <div className="flex h-full w-full flex-col rounded-2xl px-4 py-4">
      <div className="flex grow-0 rounded-tl-3xl rounded-tr-2xl bg-authGreen-600">
        <button
          onClick={() => onClickTabHandler("book")}
          className={buttonClassName("book")}
        >
          Create book
        </button>
        <button
          onClick={() => onClickTabHandler("chapter")}
          className={buttonClassName("chapter")}
        >
          Create chapter
        </button>
      </div>
      <div className="grow">{children}</div>
    </div>
  );
};

export default CreateLayout;

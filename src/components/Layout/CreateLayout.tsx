import { useState } from "react";
import type { PropsWithChildren } from "react";
import { useRouter } from "next/router";

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
      return "rounded-t-2xl bg-white px-4 font-bold text-authGreen-600";
    } else {
      return "rounded-t-2xl bg-authGreen-600 px-4 text-white hover:bg-authGreen-500";
    }
  };

  return (
    <div className="w-full gap-3 rounded-2xl p-4">
      <div className="flex rounded-tr-2xl rounded-tl-3xl bg-authGreen-600">
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
      {children}
    </div>
  );
};

export default CreateLayout;

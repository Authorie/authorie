import { getServerAuthSession } from "@server/auth";
import { type GetServerSidePropsContext } from "next";
import CreateBook from "@components/Create/CreateBook";
import { useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

type tab = "book" | "chapter";

const CreatePage = () => {
  const [tab, setTab] = useState<tab>("book");
  const onClickTabHandler = (selectedTab: tab) => {
    setTab(selectedTab);
  };

  const buttonClassName = (selectedTab: tab) => {
    if (selectedTab === tab) {
      return "rounded-t-2xl bg-gray-100 px-4 font-bold text-authGreen-600";
    } else {
      return "rounded-t-2xl bg-authGreen-600 px-4 text-white hover:bg-authGreen-500";
    }
  };

  return (
    <div className="gap-3 rounded-2xl px-10 py-4">
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
      <CreateBook />
    </div>
  );
};

export default CreatePage;

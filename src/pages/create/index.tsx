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

const CreatePage = () => {
  const [tab, setTab] = useState<string>("Create book");
  const onClickTabHandler = (selectedTab: string) => {
    setTab(selectedTab);
  };

  const buttonClassName = (selectedTab: string) => {
    if (selectedTab === tab) {
      return "rounded-t-2xl bg-white px-4 font-bold text-authGreen-600";
    } else {
      return "rounded-t-2xl bg-authGreen-600 px-4 text-white hover:bg-authGreen-500";
    }
  };

  return (
    <div className="w-full gap-3 rounded-2xl px-10 py-4">
      <div className="flex rounded-tr-2xl rounded-tl-3xl bg-authGreen-600">
        <button
          onClick={() => onClickTabHandler("Create book")}
          className={buttonClassName("Create book")}
        >
          Create book
        </button>
        <button
          onClick={() => onClickTabHandler("Create chapter")}
          className={buttonClassName("Create chapter")}
        >
          Create chapter
        </button>
      </div>
      <div className="flex items-center rounded-b-2xl bg-white px-10 py-28">
        <div className="flex w-full flex-col items-end gap-4">
          <CreateBook />
          <button className="rounded-xl bg-authBlue-500 py-2 px-8 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;

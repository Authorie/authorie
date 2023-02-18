import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { getServerAuthSession } from "@server/auth";
import NavigationSidebar from "@components/Navigation/NavigationSidebar";
import { useState } from "react";
import CategoryBar from "@components/Category/CategoryBar";
import ChapterContent from "@components/Chapter/ChapterContent";
import { api } from "@utils/api";
import CategoryChoice from "@components/Category/CategoryChoice";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  return {
    props: { session },
  };
};

const Home: NextPage = () => {
  const { data: session } = useSession();
  const { data: categories } = api.category.getAll.useQuery();
  const { data: userCategories } = api.category.getFollowed.useQuery();

  const [showCategories, setShowCategories] = useState<boolean>(false);

  const onToggleChoices = () => {
    setShowCategories(() => !showCategories);
  };

  const onCloseChoices = () => {
    setShowCategories(false);
  };

  return (
    <>
      <Head>
        <title>Authorie</title>
        <meta
          name="description"
          content="Social media and publishing platform!"
        />
      </Head>
      <div className="flex justify-center">
        <NavigationSidebar />
        <div className="border-l-2 px-10">
          <div className="my-4 flex h-[329px] w-[1100px] flex-col overflow-hidden rounded-xl bg-neutral-500">
            <div className="flex h-[269px] items-center justify-center rounded-xl bg-dark-600">
              {!showCategories ? (
                <h1 className="text-8xl text-white">For Ads</h1>
              ) : (
                <CategoryChoice
                  categoriesList={categories}
                  onCloseCategories={onCloseChoices}
                />
              )}
            </div>
            <div className="h-[10px]" />
            <CategoryBar
              openCategories={showCategories}
              onOpenCategories={onToggleChoices}
              categories={userCategories}
            />
          </div>
          <ChapterContent />
        </div>
      </div>
    </>
  );
};

export default Home;

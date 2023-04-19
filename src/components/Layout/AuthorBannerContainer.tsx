import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Custom404 from "~/pages/404";
import { api } from "~/utils/api";
import AuthorBanner from "./AuthorBanner";
import AuthorBannerSkeleton from "./AuthorBannerSkeleton";

const authorTabs = [
  { title: "HOME", url: "" },
  { title: "COMMUNITY", url: "community" },
  { title: "BOOK", url: "book" },
  { title: "ABOUT", url: "about" },
] as const;

export type AuthorTab = (typeof authorTabs)[number];

const parseUserTab = (pathname: string | undefined) => {
  const tab = authorTabs.find((t) => t.url === pathname?.toLowerCase());
  return tab || authorTabs[0];
};

function getAuthorTabButtonClassname(selected: boolean) {
  return `
    ${selected
      ? "text-green-500 underline decoration-green-500 underline-offset-2"
      : "cursor-pointer text-white"
    }
    select-none px-11 py-3 text-sm hover:bg-black/30
  `;
}

const AuthorBannerContainer = () => {
  const router = useRouter();
  const { status } = useSession();
  const penname = router.query.penname as string;
  const tab = useMemo(
    () => parseUserTab(router.pathname.split("/")[2]),
    [router.pathname]
  );
  const { data: user } = api.user.getData.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const isOwner =
    status === "authenticated" && router.isReady && user?.penname === penname;
  const { data: userInBanner, isLoading } = api.user.getData.useQuery(
    isOwner ? undefined : penname,
    {
      enabled: router.isReady,
    }
  );

  return (
    <>
      <div className="relative h-fit min-w-full">
        {!userInBanner && !isLoading && <Custom404 />}
        {userInBanner ? (
          <AuthorBanner tab={tab} user={userInBanner} />
        ) : (
          <AuthorBannerSkeleton />
        )}
      </div>
      <div className="sticky top-0 z-30 ml-40 w-full self-start">
        <div className="flex max-w-xl items-center justify-between bg-black/60 shadow-lg backdrop-blur-lg">
          {authorTabs.map((data) => (
            <button
              key={data.title}
              onClick={() => void router.push(`/${penname}/${data.url}`)}
              className={getAuthorTabButtonClassname(data.title === tab.title)}
            >
              {data.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AuthorBannerContainer;

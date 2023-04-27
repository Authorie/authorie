import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import CommunityInput from "~/components/Community/CommunityInput";
import CommunityInputSkeleton from "~/components/Community/CommunityInputSkeleton";
import CommunityPost from "~/components/Community/CommunityPost";
import CommunitySkeleton from "~/components/Community/CommunitySkeleton";
import { api } from "~/utils/api";

const CommunityPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const communityPenname = router.query.penname as string;
  const { data: user, isInitialLoading } = api.user.getData.useQuery(
    undefined,
    {
      enabled: status === "authenticated",
    }
  );
  const { data: communityPostIds } = api.communityPosts.getAllPosts.useQuery(
    {
      penname: communityPenname,
    },
    {
      enabled: router.isReady,
    }
  );
  const communityPosts = api.useQueries(
    (t) =>
      communityPostIds?.map((communityPostId) =>
        t.communityPosts.getPost(communityPostId)
      ) ?? []
  );
  return (
    <div className="flex gap-5">
      <div className="my-8 flex w-fit flex-col items-start justify-start gap-7">
        {user && (
          <CommunityInput
            penname={user.penname!}
            communityPenname={communityPenname}
            userImg={user.image ?? "/placeholder_profile.png"}
          />
        )}
        {isInitialLoading && <CommunityInputSkeleton />}
        {communityPosts.map(({ data: post }, index) =>
          post ? (
            <CommunityPost
              key={post.id}
              post={post}
              isAuthenticated={status === "authenticated"}
            />
          ) : (
            <CommunitySkeleton key={index} />
          )
        )}
        {communityPosts.length === 0 && (
          <div className="flex h-96 w-[580px] items-center justify-center rounded-lg bg-white text-center text-lg font-semibold">
            This community page still does not have any discussions.
          </div>
        )}
      </div>
      <div className="sticky top-5 mt-8 flex h-96 w-[380px] items-center justify-center rounded-lg bg-white text-2xl font-bold">
        Authorie
      </div>
    </div>
  );
};

export default CommunityPage;

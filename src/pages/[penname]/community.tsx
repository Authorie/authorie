import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import CommunityInput from "~/components/Community/CommunityInput";
import CommunityPost from "~/components/Community/CommunityPost";
import { api } from "~/utils/api";

const CommunityPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const communityPenname = router.query.penname;
  const { data: communityPosts } = api.communityPosts.getAllPosts.useQuery({
    penname: communityPenname as string,
  });
  return (
    <div className="flex gap-5">
      <div className="my-8 flex w-fit flex-col items-start justify-start gap-7">
        {session && (
          <CommunityInput
            penname={session?.user.penname as string}
            communityPenname={communityPenname as string}
            userImg={session?.user.image as string}
          />
        )}
        {communityPosts?.map((post) => (
          <CommunityPost
            key={post.id}
            isAuthenticated={status === "authenticated"}
            id={post.id}
          />
        ))}
      </div>
      <div className="sticky top-5 mt-8 flex h-96 w-[380px] items-center justify-center rounded-lg bg-white text-2xl font-bold">
        Authorie
      </div>
    </div>
  );
};

export default CommunityPage;

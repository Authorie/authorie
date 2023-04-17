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
    <div className="my-8 flex h-full w-full flex-col items-start justify-start gap-7 pl-20">
      {session && (
        <CommunityInput
          penname={session?.user.penname as string}
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
  );
};

export default CommunityPage;

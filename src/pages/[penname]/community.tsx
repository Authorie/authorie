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
    <div className="mt-8 flex h-full w-full items-start justify-center">
      {session && (
        <CommunityInput
          penname={session?.user.penname as string}
          userImg={session?.user.image as string}
        />
      )}
      {communityPosts?.map((post) => (
        <CommunityPost
          key={post.id}
          penname={post.user.penname as string}
          userImg={post.user.image}
          discussion={post.content}
          discussionTitle={post.title}
          discussionImage={post.image}
          isLiked={true}
          numberOfLike={post._count.likes}
          isAuthenticated={status === "authenticated"}
          numberOfComment={post._count.children}
          id={post.id}
        />
      ))}
    </div>
  );
};

export default CommunityPage;

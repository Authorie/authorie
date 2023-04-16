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
    <div className="my-8 flex h-full w-full flex-col items-start justify-center gap-7 pl-20">
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
      <CommunityPost
        key={1}
        penname={"four"}
        userImg={"/FourPicture.png"}
        discussion={
          "Function invoked on textarea height change, with height as first argument. The second function argument is an object containing additional information that might be useful for custom behaviors. Current options include { rowHeight: number }."
        }
        discussionTitle={"Codeing"}
        discussionImage={"/FourPicture.png"}
        isLiked={true}
        numberOfLike={44}
        isAuthenticated={status === "authenticated"}
        numberOfComment={3}
        id={"eiei"}
      />
    </div>
  );
};

export default CommunityPage;

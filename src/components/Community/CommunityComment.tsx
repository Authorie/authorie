import { api } from "~/utils/api";

type props = {
  id: string;
};

const CommunityComment = ({ id }: props) => {
  const comment = api.communityPosts.getPost.useQuery({ id });
  return <div className="flex"></div>;
};

export default CommunityComment;

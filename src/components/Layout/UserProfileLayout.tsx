import { userInfo } from "mocks/search";
import UserBanner from "./UserBanner";
import type { PropsWithChildren } from "react";

const UserProfileLayout = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <UserBanner
        penname={userInfo[0]?.penname}
        bio={userInfo[0]?.bio}
        followers={userInfo[0]?.followers}
        following={userInfo[0]?.following}
        followed={false}
      />
      <main>{children}</main>
    </div>
  );
};

export default UserProfileLayout;

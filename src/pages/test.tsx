import { NextPage } from "next";
import NavigationSidebar from "../components/Navigation/NavigationSidebar";

const user = {
  username: "nongfameza",
  profileImage:
    "https://thumbs.dreamstime.com/b/cute-cat-portrait-square-photo-beautiful-white-closeup-105311158.jpg",
  coin: 3120,
};

const Test: NextPage = () => {
  return <NavigationSidebar {...user} />;
};
export default Test;

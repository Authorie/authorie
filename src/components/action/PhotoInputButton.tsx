import { Popover } from "@headlessui/react";
import UploadImageInput from "../Comment/UploadImageInput";
import { HiOutlinePhoto } from "react-icons/hi2";

type props = {
  setImageUrl: (image: string) => void;
  color?: string;
  hoverColor?: string;
  top?: string;
};

export const PhotoInputButton = ({
  setImageUrl,
  color,
  hoverColor,
  top,
}: props) => {
  return (
    <Popover>
      <Popover.Panel className="relative">
        <div className={`absolute -left-10 ${top ? `${top}` : "top-8"}`}>
          <UploadImageInput onClick={(image) => setImageUrl(image)} />
        </div>
      </Popover.Panel>
      <Popover.Button
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg outline-none hover:bg-${
          hoverColor ? `${hoverColor}` : "gray-500"
        } focus:outline-none`}
      >
        <HiOutlinePhoto
          className={`h-5 w-5 text-${color ? `${color}` : "white"}`}
        />
      </Popover.Button>
    </Popover>
  );
};

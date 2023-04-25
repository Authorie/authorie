import { Popover } from "@headlessui/react";
import { HiOutlinePhoto } from "react-icons/hi2";
import UploadImageInput from "../Comment/UploadImageInput";

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
    <Popover className="z-10">
      <Popover.Panel className="relative">
        {({ close }) => (
          <div className={`absolute -left-10 ${top ? `${top}` : "top-8"}`}>
            <UploadImageInput
              onSubmit={(imageUrl: string) => {
                setImageUrl(imageUrl);
                close();
              }}
            />
          </div>
        )}
      </Popover.Panel>
      <Popover.Button
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg outline-none hover:bg-${hoverColor ? `${hoverColor}` : "gray-500"
          } focus:outline-none`}
      >
        <HiOutlinePhoto
          className={`h-5 w-5 text-${color ? `${color}` : "white"}`}
        />
      </Popover.Button>
    </Popover>
  );
};

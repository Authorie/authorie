import { Popover } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import { api } from "~/utils/api";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { RiCloseFill, RiImageLine } from "react-icons/ri";
import useImageUpload from "~/hooks/imageUpload";

const ImageInputButton = ({ editor }: { editor: Editor }) => {
  const [InputUrl, setInputUrl] = useState({ value: "" });
  const uploadImage = api.upload.uploadImage.useMutation();
  const { imageData, uploadHandler, imageName, resetImageData } =
    useImageUpload();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    resetImageData();
    setInputUrl({ value: e.target.value });
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let profileImageUrl;
    if (imageData) {
      profileImageUrl = await uploadImage.mutateAsync({
        image: imageData,
      });
      editor.chain().focus().setImage({ src: profileImageUrl }).run();
      resetImageData();
    } else {
      editor.chain().focus().setImage({ src: InputUrl.value }).run();
      setInputUrl({ value: "" });
    }
  };

  return (
    <Popover className="relative flex content-center">
      <Popover.Button className="h-fit self-center rounded p-1 hover:bg-gray-300">
        <RiImageLine className="h-4 w-4" />
      </Popover.Button>

      <Popover.Panel
        className="absolute right-0 top-0 z-10 flex translate-y-10 flex-col rounded bg-white p-1 px-2 drop-shadow-lg"
        as="form"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="flex flex-row py-1">
          <input
            className="w-full rounded border px-2 focus:outline-none"
            type="url"
            placeholder="Paste link here"
            onChange={handleChange}
          />
          <button type="reset" value="x" className="bold m-1">
            <RiCloseFill className="h-4 w-4" />
          </button>
        </div>
        <div className="flex w-96 flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="add-image" className="w-fit">
              <input
                hidden
                id="add-image"
                type="file"
                className="m-1 rounded-md p-1 hover:bg-slate-200"
                onChange={uploadHandler}
              />
              <div className="cursor-pointer rounded-full bg-gradient-to-b from-green-500 to-green-400 px-4 py-1 text-center text-white hover:bg-gradient-to-b hover:from-green-600 hover:to-green-400">
                Choose file
              </div>
            </label>
            <button
              type="submit"
              className="m-1 rounded-md bg-slate-200 px-3 py-1 hover:bg-slate-300"
            >
              Submit
            </button>
          </div>
          <p className="text-xs">{imageName}</p>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ImageInputButton;

import { Popover } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import ImageLineIcon from "remixicon-react/ImageLineIcon";
import CloseFillIcon from "remixicon-react/CloseFillIcon";

const ImageInputButton = ({ editor }: { editor: Editor }) => {
  const [InputUrl, setInputUrl] = useState({ value: "" });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputUrl({ value: e.target.value });
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    editor.chain().focus().setImage({ src: InputUrl.value }).run();
  };

  return (
    <Popover className="relative flex content-center">
      <Popover.Button className="h-fit self-center rounded p-1 hover:bg-slate-100">
        <ImageLineIcon className="h-4 w-4" />
      </Popover.Button>

      <Popover.Panel
        className="absolute top-0 right-0 z-10 flex translate-y-10 flex-col rounded bg-white p-1 drop-shadow-lg"
        as="form"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row">
          <input
            className="w-full mx-2 focus:outline-none"
            type="url"
            placeholder="Paste link here"
            onChange={handleChange}
          />
          <button type="reset" value="x" className="bold m-1">
            <CloseFillIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-row">
          <input
            type="file"
            className="m-1 rounded-md p-1 hover:bg-slate-200"
          />
          <button
            type="submit"
            className="m-1 rounded-md p-1 bg-slate-100 hover:bg-slate-200"
          >
            Submit
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ImageInputButton;

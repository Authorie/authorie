import { Popover } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { RiCloseFill, RiLink } from "react-icons/ri";

const LinkInputButton = ({ editor }: { editor: Editor }) => {
  const [InputUrl, setInputUrl] = useState({ value: "" });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputUrl({ value: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    editor.chain().focus().setLink({ href: InputUrl.value }).run();
  };

  return (
    <Popover className="relative flex content-center">
      <Popover.Button className="h-fit self-center rounded p-1 hover:bg-gray-300">
        <RiLink className="h-4 w-4" />
      </Popover.Button>

      <Popover.Panel
        className="absolute right-0 top-0 z-10 flex translate-y-10 flex-row rounded bg-white p-1 drop-shadow-lg"
        as="form"
        onSubmit={handleSubmit}
      >
        <input
          className="w-50 mx-2 focus:outline-none"
          type="url"
          placeholder="Paste link here"
          onChange={handleChange}
        />
        <button type="reset" value="x" className="bold m-1">
          <RiCloseFill className="h-4 w-4" />
        </button>
      </Popover.Panel>
    </Popover>
  );
};

export default LinkInputButton;

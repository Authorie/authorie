import { Popover } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import LinkIcon from "remixicon-react/LinkIcon";

const LinkInputButton = ({ editor }: { editor: Editor }) => {
  const [InputUrl, setInputUrl] = useState({ value: "" });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputUrl({ value: e.target.value });
  };

  return (
    <Popover className="relative flex content-center">
      <Popover.Button className="h-fit self-center rounded p-1 hover:bg-slate-100">
        <LinkIcon className="h-4 w-4" />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 translate-y-10 rounded bg-white p-1 drop-shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editor.chain().focus().setLink({ href: InputUrl.value }).run();
          }}
          className="flex"
        >
          <input
            className="w-50 mx-2 focus:outline-none"
            type="url"
            placeholder="Paste link here"
            onChange={handleChange}
          ></input>
          <input type="reset" value="x" className="bold m-1"></input>
        </form>
      </Popover.Panel>
    </Popover>
  );
};

export default LinkInputButton;

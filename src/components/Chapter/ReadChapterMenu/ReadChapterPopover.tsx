import { Listbox, Popover, Transition } from "@headlessui/react";
import type { Editor } from "@tiptap/core";
import type { ChangeEvent } from "react";
import { Fragment, useEffect, useState } from "react";
import {
  HiOutlineChevronUpDown,
  HiOutlineMinusCircle,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { RiMarkPenLine, RiText } from "react-icons/ri";

const fonts = [
  { id: "Inter", name: "Inter" },
  { id: "Arial", name: "Arial" },
  { id: "Times New Roman", name: "Times New Roman" },
  { id: "Thonburi", name: "Thonburi" },
  { id: "Helvetica", name: "Helvetica" },
  { id: "Verdana", name: "Verdana" },
  { id: "Futura", name: "Futura" },
];

const ReadChapterPopover = ({ editor }: { editor: Editor | null }) => {
  let initialTextSize;
  let initialFontFamily: string | null;
  if (typeof localStorage !== "undefined" && localStorage.getItem("textSize")) {
    initialTextSize = localStorage.getItem("textSize");
  } else {
    initialTextSize = null;
  }
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem("fontFamily")
  ) {
    initialFontFamily = localStorage.getItem("fontFamily");
  } else {
    initialFontFamily = null;
  }
  const [textSize, setTextSize] = useState(
    initialTextSize ? +initialTextSize : 16
  );
  let foundFont = null;
  if (initialFontFamily) {
    foundFont = fonts.find((font) => font.id === initialFontFamily);
  }

  const [fontFamily, setFontFamily] = useState(
    foundFont
      ? foundFont
      : (fonts[0] as {
          id: string;
          name: string;
        })
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--editor-h2",
      (textSize / 16).toString() + "rem"
    );
    localStorage.setItem("textSize", textSize.toString());
  }, [textSize]);

  useEffect(() => {
    editor?.chain().selectAll().setFontFamily(fontFamily.id).run();
    localStorage.setItem("fontFamily", fontFamily.id);
  }, [editor, fontFamily]);

  const onSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextSize(+e.target.value);
  };
  return (
    <Popover className="relative">
      <Popover.Button>
        <button className="flex cursor-pointer items-center rounded-full border border-white p-1 text-white hover:bg-gray-500">
          <RiText className="h-3 w-3" />
        </button>
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-52 -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
          <div className="flex flex-col gap-1 rounded-lg bg-black bg-opacity-60 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setTextSize(textSize - 1);
                }}
                className="m-1 flex h-7 w-7 cursor-pointer items-center justify-center text-white"
              >
                <HiOutlineMinusCircle />
              </button>
              <input
                onChange={onSizeChange}
                className="w-10 rounded-sm bg-transparent text-center text-white outline-none [appearance:textfield]
                focus:outline-none [&::-webkit-inner-spin-button]:appearance-none 
                [&::-webkit-outer-spin-button]:appearance-none"
                size={10}
                value={textSize}
                type="number"
              />
              <button
                onClick={() => {
                  setTextSize(textSize + 1);
                }}
                className="m-1 flex h-7 w-7 cursor-pointer items-center justify-center text-white"
              >
                <HiOutlinePlusCircle />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  editor?.commands.toggleHighlight();
                }}
                className="m-1 flex h-7 w-7 cursor-pointer items-center rounded px-1 text-white hover:bg-gray-500"
              >
                <RiMarkPenLine />
              </button>

              <Listbox value={fontFamily} onChange={setFontFamily}>
                <div className="relative">
                  <Listbox.Button
                    className="relative w-full cursor-default rounded-lg bg-white 
                  py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm"
                  >
                    <span className="block w-20 truncate">
                      {fontFamily.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <HiOutlineChevronUpDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options
                      className="absolute right-0 mt-1 max-h-60
                     overflow-hidden overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm"
                    >
                      {fonts.map((font, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative w-full cursor-default select-none whitespace-nowrap py-2 pl-5 pr-4 ${
                              active
                                ? "bg-authGreen-300 text-authGreen-600"
                                : "text-gray-900"
                            }`
                          }
                          value={font}
                        >
                          {font.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
export default ReadChapterPopover;

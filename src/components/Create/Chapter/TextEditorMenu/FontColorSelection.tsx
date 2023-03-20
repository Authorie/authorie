import { Listbox } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

const FontColorSelection = ({ editor }: { editor: Editor }) => {
  const colors = [
    { name: "Black", value: "#000", tailwindcolor: "bg-black" },
    { name: "Red", value: "#ef4444", tailwindcolor: "bg-red-500" },
    { name: "Green", value: "#22c55e", tailwindcolor: "bg-green-500" },
    { name: "Blue", value: "#3b82f6", tailwindcolor: "bg-blue-500" },
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const colorChangeHandler = (color: {
    id: number;
    name: string;
    value: string;
    tailwindcolor: string;
  }) => {
    setSelectedColor(color);
    editor.chain().focus().setColor(color.value).run();
  };

  const activeColorChecker = () => {
    for (const color of colors) {
      if (editor.isActive("textStyle", { color: color.value })) {
        return color.tailwindcolor;
      }
    }
    return "bg-black";
  };

  return (
    <div className="relative flex">
      <Listbox value={selectedColor} by="id" onChange={colorChangeHandler}>
        <Listbox.Button
          onFocus={() => editor.commands.focus()}
          className="h-fit w-fit place-self-center rounded p-2 hover:bg-gray-300"
        >
          <div className={`h-3 w-3 ${activeColorChecker()} rounded`} />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 flex translate-y-10 rounded bg-white drop-shadow-lg">
          {colors.map((color) => (
            <Listbox.Option
              key={color.name}
              title={color.name}
              value={color}
              className={`${
                editor.isActive("textStyle", { color: color.value })
                  ? "bg-slate-300"
                  : "bg-white"
              } m-1 h-7 rounded-md p-2 hover:bg-slate-200`}
            >
              <div className={`${color.tailwindcolor} h-3 w-3 rounded`} />
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

export default FontColorSelection;

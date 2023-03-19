import { Listbox } from "@headlessui/react";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

const FontColorSelection = ({ editor }: { editor: Editor }) => {
  const colors = [
    { id: 1, name: "Black   ", value: "#000", tailwindcolor: "black" },
    { id: 4, name: "Blue", value: "#3b82f6", tailwindcolor: "blue-500" },
    { id: 2, name: "Red", value: "#ef4444", tailwindcolor: "red-500" },
    { id: 3, name: "Green", value: "#22c55e", tailwindcolor: "green-500" },
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const fontHandler = (color: {
    id: number;
    name: string;
    value: string;
    tailwindcolor: string;
  }) => {
    setSelectedColor(color);
    editor.chain().focus().setColor(color.value).run();
  };

  const TempColorChecker = () => {
    colors.forEach((i) => {
      if (editor.isActive("textStyle", { color: i.value })) {
        return i.tailwindcolor;
      }
    });
    return "black";
  };

  return (
    <div className="relative flex">
      <Listbox value={selectedColor} by="id" onChange={fontHandler}>
        <Listbox.Button
          onFocus={() => editor.commands.focus()}
          className="h-fit w-fit place-self-center rounded p-2 hover:bg-slate-200"
        >
          <div className={`h-3 w-3 bg-${TempColorChecker()} rounded`}></div>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 flex translate-y-10 rounded bg-white drop-shadow-lg">
          {colors.map((color) => (
            <Listbox.Option
              key={color.id}
              value={color}
              title={color.name}
              className={`${
                editor.isActive("textStyle", { color: color.value })
                  ? "bg-slate-300"
                  : "bg-white"
              } 
                            m-1 h-7 rounded-md p-2 hover:bg-slate-200`}
            >
              <div
                className={`bg-${color.tailwindcolor} h-3 w-3 rounded`}
              ></div>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

export default FontColorSelection;

import { Menu } from "@headlessui/react";
import {
  RiAddCircleLine,
  RiDeleteBinLine,
  RiMergeCellsHorizontal,
  RiSplitCellsHorizontal,
  RiTableLine,
} from "react-icons/ri";

import type { Editor } from "@tiptap/react";

import { Fragment } from "react";

const TableMenu = ({ editor }: { editor: Editor }) => {
  const tableItems = [
    {
      name: "Insert table",
      Icon: RiAddCircleLine,
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      name: "Delete table",
      Icon: RiDeleteBinLine,
      action: () => editor.chain().focus().deleteTable().run(),
    },
    {
      Icon: Fragment,
      title: "divider",
    },
    {
      name: "Insert column before",
      Icon: RiAddCircleLine,
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      name: "Insert column after",
      Icon: RiAddCircleLine,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      name: "Insert row before",
      Icon: RiAddCircleLine,
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      name: "Insert row after",
      Icon: RiAddCircleLine,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      Icon: "",
      title: "divider",
    },
    {
      name: "Delete column",
      Icon: RiDeleteBinLine,
      action: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      name: "Delete row",
      Icon: RiDeleteBinLine,
      action: () => editor.chain().focus().deleteRow().run(),
    },
    {
      Icon: Fragment,
      title: "divider",
    },
    {
      name: "Merge cells",
      Icon: RiMergeCellsHorizontal,
      action: () => editor.chain().focus().mergeCells().run(),
    },
    {
      name: "Split cell",
      Icon: RiSplitCellsHorizontal,
      action: () => editor.chain().focus().splitCell().run(),
    },
  ];

  return (
    <div className="relative flex content-center">
      <Menu>
        <Menu.Button className=" h-fit self-center rounded p-1 hover:bg-gray-300">
          <RiTableLine className="h-4 w-4" />
        </Menu.Button>
        <Menu.Items className="absolute z-10 flex w-fit translate-y-10 flex-col rounded bg-white p-1 drop-shadow-lg">
          {tableItems.map((item, index) => (
            <Fragment key={index}>
              <Menu.Item>
                {item.title === "divider" ? (
                  <div className="m-3 h-0.5 w-11/12 self-center bg-slate-300" />
                ) : (
                  <button
                    onClick={item.action}
                    className={`justify-content-start m-1 flex gap-1 whitespace-nowrap rounded-md p-1 hover:bg-slate-200`}
                  >
                    <item.Icon className="h-4 w-4 self-center" />
                    {item.name}
                  </button>
                )}
              </Menu.Item>
            </Fragment>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default TableMenu;

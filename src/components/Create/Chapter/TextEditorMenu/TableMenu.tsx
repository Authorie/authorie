import { Menu } from "@headlessui/react";
import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import MergeCellsHorizontalIcon from "remixicon-react/MergeCellsHorizontalIcon";
import SplitCellsHorizontalIcon from "remixicon-react/SplitCellsHorizontalIcon";
import TableLineIcon from "remixicon-react/TableLineIcon";

import type { Editor } from "@tiptap/react";

import { Fragment } from "react";

const TableMenu = ({ editor }: { editor: Editor }) => {
  const tableItems = [
    {
      name: "Insert table",
      Icon: AddCircleLineIcon,
      action: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      name: "Delete table",
      Icon: DeleteBinLineIcon,
      action: () => editor.chain().focus().deleteTable().run(),
    },
    {
      Icon: Fragment,
      title: "divider",
    },
    {
      name: "Insert column before",
      Icon: AddCircleLineIcon,
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      name: "Insert column after",
      Icon: AddCircleLineIcon,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      name: "Insert row before",
      Icon: AddCircleLineIcon,
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      name: "Insert row after",
      Icon: AddCircleLineIcon,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      Icon: "",
      title: "divider",
    },
    {
      name: "Delete column",
      Icon: DeleteBinLineIcon,
      action: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      name: "Delete row",
      Icon: DeleteBinLineIcon,
      action: () => editor.chain().focus().deleteRow().run(),
    },
    {
      Icon: Fragment,
      title: "divider",
    },
    {
      name: "Merge cells",
      Icon: MergeCellsHorizontalIcon,
      action: () => editor.chain().focus().mergeCells().run(),
    },
    {
      name: "Split cell",
      Icon: SplitCellsHorizontalIcon,
      action: () => editor.chain().focus().splitCell().run(),
    },
  ];

  return (
    <div className="relative flex content-center">
      <Menu>
        <Menu.Button className=" h-fit self-center rounded p-1 hover:bg-slate-100">
          <TableLineIcon className="h-4 w-4" />
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

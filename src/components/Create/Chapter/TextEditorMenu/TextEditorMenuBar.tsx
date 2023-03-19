import type { Editor } from "@tiptap/react";

import type { CharacterCountStorage } from "@tiptap/extension-character-count";
import { Fragment } from "react";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import ArrowRightLineIcon from "remixicon-react/ArrowRightLineIcon";
import BoldIcon from "remixicon-react/BoldIcon";
import FormatClearIcon from "remixicon-react/FormatClearIcon";
import H1Icon from "remixicon-react/H1Icon";
import H2Icon from "remixicon-react/H2Icon";
import ItalicIcon from "remixicon-react/ItalicIcon";
import ListOrderedIcon from "remixicon-react/ListOrderedIcon";
import ListUnorderedIcon from "remixicon-react/ListUnorderedIcon";
import MarkPenLineIcon from "remixicon-react/MarkPenLineIcon";
import ParagraphIcon from "remixicon-react/ParagraphIcon";
import StrikethroughIcon from "remixicon-react/StrikethroughIcon";
import UnderlineIcon from "remixicon-react/UnderlineIcon";
import FontColorSelection from "./FontColorSelection";
import ImageInputButton from "./ImageInputButton";
import LinkInputButton from "./LinkInputButton";
import TableMenu from "./TableMenu";
import TextEditorMenuItem from "./TextEditorMenuToggle";

function isCharacterCountStorage(
  characterCount: unknown
): characterCount is CharacterCountStorage {
  const temp = characterCount as CharacterCountStorage;
  return temp.characters !== undefined && temp.words !== undefined;
}

const TextEditorMenuBar = ({ editor }: { editor: Editor }) => {
  const ToggleButtons = [
    {
      icon: ArrowLeftLineIcon,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: ArrowRightLineIcon,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: BoldIcon,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: ItalicIcon,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      icon: StrikethroughIcon,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: MarkPenLineIcon,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("highlight"),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: H1Icon,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: H2Icon,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: ParagraphIcon,
      title: "Paragraph",
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive("paragraph"),
    },
    {
      icon: ListUnorderedIcon,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrderedIcon,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: FormatClearIcon,
      title: "Clear Format",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      icon: Fragment,
      title: "divider",
    },
  ];

  return (
    <div className="flex flex-row flex-nowrap content-center justify-start pb-4">
      {ToggleButtons.map((item, index) => (
        <Fragment key={index}>
          <TextEditorMenuItem {...item}></TextEditorMenuItem>
        </Fragment>
      ))}
      <FontColorSelection editor={editor}></FontColorSelection>
      <TextEditorMenuItem
        {...{ icon: Fragment, title: "divider" }}
      ></TextEditorMenuItem>
      <LinkInputButton editor={editor}></LinkInputButton>
      <TableMenu editor={editor}></TableMenu>
      <ImageInputButton editor={editor}></ImageInputButton>
      <TextEditorMenuItem
        {...{ icon: Fragment, title: "divider" }}
      ></TextEditorMenuItem>
      <div className="self-center text-slate-500">
        {"characterCount" in editor.storage &&
          isCharacterCountStorage(editor.storage.characterCount) &&
          editor.storage.characterCount.words()}{" "}
        words
      </div>
      <TextEditorMenuItem
        {...{ icon: Fragment, title: "divider" }}
      ></TextEditorMenuItem>
      <div className="self-center text-slate-500">
        {"characterCount" in editor.storage &&
          isCharacterCountStorage(editor.storage.characterCount) &&
          editor.storage.characterCount.characters()}{" "}
        characters
      </div>
    </div>
  );
};

export default TextEditorMenuBar;
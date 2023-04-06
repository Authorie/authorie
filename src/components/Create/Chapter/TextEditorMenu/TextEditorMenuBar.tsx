import type { Editor } from "@tiptap/react";

import type { CharacterCountStorage } from "@tiptap/extension-character-count";
import { Fragment } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBold,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiStrikethrough,
  RiUnderline,
} from "react-icons/ri";
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
      icon: RiArrowLeftLine,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: RiArrowRightLine,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: RiBold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: RiItalic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: RiUnderline,
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      icon: RiStrikethrough,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: RiMarkPenLine,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("highlight"),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: RiH1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: RiH2,
      title: "Paragraph",
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive("paragraph"),
    },
    {
      icon: RiH3,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: RiListUnordered,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: RiListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Fragment,
      title: "divider",
    },
    {
      icon: RiFormatClear,
      title: "Clear Format",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      icon: Fragment,
      title: "divider",
    },
  ];

  return (
    <div className="flex rounded-lg bg-gray-200 px-4 py-1">
      {ToggleButtons.map((item, index) => (
        <TextEditorMenuItem key={item.title + String(index)} {...item} />
      ))}
      <FontColorSelection editor={editor} />
      <TextEditorMenuItem icon={Fragment} title="divider" />
      <LinkInputButton editor={editor} />
      <TableMenu editor={editor} />
      <ImageInputButton editor={editor} />
      <TextEditorMenuItem icon={Fragment} title="divider" />
      <div className="w-16 self-center truncate text-xs text-slate-500">
        {"characterCount" in editor.storage &&
          isCharacterCountStorage(editor.storage.characterCount) &&
          editor.storage.characterCount.words()}{" "}
        words
      </div>
    </div>
  );
};

export default TextEditorMenuBar;

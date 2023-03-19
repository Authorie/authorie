import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { Heading } from "./TextEditorMenu/Heading";
import TextEditorMenuBar from "./TextEditorMenu/TextEditorMenuBar";

type props = {
  content: JSONContent | null;
  onEditorUpdate: (content: JSONContent) => void;
};

const TextEditor = ({ content, onEditorUpdate }: props) => {
  const editor = useEditor({
    content,
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: "text-base",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc px-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal px-4",
          },
        },
      }),
      Underline,
      Heading,
      Highlight,
      TextStyle,
      Color,
      Link.configure({
        HTMLAttributes: {
          class:
            "rounded shadow-md bg-white p-1 hover:underline hover:bg-slate-100 text-blue-500",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            "border-collapse m-0 select-all overflow-hidden w-full table-auto",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "select-all",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid bg-slate-200 relative text-left select-all",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class:
            "border-slate-500 border-2 border-solid w-20 text-left select-all",
        },
      }),
      Image,
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] w-full px-5",
      },
    },
    onUpdate: ({ editor }) => {
      onEditorUpdate(editor.getJSON());
    },
    autofocus: "start",
  });

  useEffect(() => {
    editor?.commands.setContent(content, false);
  }, [content, editor]);

  return (
    <div className="min-h-[500px]">
      {editor && <TextEditorMenuBar editor={editor}></TextEditorMenuBar>}
      <EditorContent className="h-full w-full" editor={editor} />
    </div>
  );
};

export default TextEditor;

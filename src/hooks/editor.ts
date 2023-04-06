import { mergeAttributes } from "@tiptap/core";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import FontFamily from "@tiptap/extension-font-family";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import BaseHeading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { Content, Extensions } from "@tiptap/react";
import { useEditor as useTiptapEditor } from "@tiptap/react";

type Levels = 1 | 2;

const classes = {
  1: "text-[length:var(--editor-h1)]",
  2: "text-[length:var(--editor-h3)]",
} as const;

export const Heading = BaseHeading.configure({ levels: [1, 2] }).extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level as number);
    const level: Levels = hasLevel
      ? (node.attrs.level as Levels)
      : (this.options.levels[0] as Levels);

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `${classes[level]}`,
      }),
      0,
    ];
  },
});

const extensions = [
  Document,
  HardBreak,
  ListItem,
  Text,
  Bold,
  Italic,
  Strike,
  Dropcursor,
  Gapcursor,
  History,
  Paragraph.configure({
    HTMLAttributes: {
      class: "text-[length:var(--editor-h2)]",
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc px-4",
    },
  }),

  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal px-4",
    },
  }),
  Underline,
  Heading,
  Highlight,
  TextStyle,
  FontFamily,
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
      class: "border-collapse m-0 select-all overflow-hidden w-full table-auto",
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
      class: "border-slate-500 border-2 border-solid w-20 text-left select-all",
    },
  }),
  Image,
  CharacterCount,
] as Extensions;

export const useEditor = (content: Content) => {
  const editor = useTiptapEditor({
    editable: true,
    content: content,
    extensions: extensions,
    autofocus: "start",
  });

  return editor;
};

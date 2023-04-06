import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import FontFamily from "@tiptap/extension-font-family";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { Content } from "@tiptap/react";
import { useEditor } from "@tiptap/react";

export const useReader = (content: Content) => {
  return useEditor({
    content,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Underline,
      Heading,
      FontFamily,
      TextStyle,
    ],
    autofocus: false,
    editable: false,
  });
};

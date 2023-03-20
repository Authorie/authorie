import { mergeAttributes } from "@tiptap/core";
import BaseHeading from "@tiptap/extension-heading";

type Levels = 1 | 2;

const classes = {
  1: "text-xs",
  2: "text-xl",
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

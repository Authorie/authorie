import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

import { Heading } from './TextEditorMenu/Heading';
import TextEditorMenuBar from './TextEditorMenu/TextEditorMenuBar';

const TextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: 'text-base'
          }
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc px-4'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal px-4'
          }
        }
      }),
      Underline,
      Heading,
      Highlight,
      TextStyle,
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] w-full px-5',
      },
    },
    onUpdate: ({ editor }) => {
      const output = editor.getJSON()
      console.log(output);
      // send the content to an API here
    },
    autofocus: 'start',
  })

  return (
    <div className="min-h-[500px]">
      {editor && <TextEditorMenuBar editor={editor}></TextEditorMenuBar>}
      <EditorContent className='h-full w-full' editor={editor} />
    </div>
  );
};

export default TextEditor;

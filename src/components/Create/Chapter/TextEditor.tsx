import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'

import { Heading } from './TextEditorMenu/Heading';
import TextEditorMenuBar from './TextEditorMenu/TextEditorMenuBar';

import { api } from '@utils/api'

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
      Link.configure({
        HTMLAttributes: {
          class: 'rounded shadow-md bg-white p-1 hover:underline hover:bg-slate-100 text-blue-500'
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse m-0 select-all overflow-hidden w-full table-auto'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'select-all'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border-slate-500 border-2 border-solid bg-slate-200 relative text-left select-all'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border-slate-500 border-2 border-solid w-20 text-left select-all'
        }
      }),
      Image,
      CharacterCount,

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

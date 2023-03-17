import { Editor } from '@tiptap/react'

import { Fragment } from 'react'

import TextEditorMenuItem from './TextEditorMenuToggle'
import FontCOlorSelection from './FontColorSelection'

const TextEditorMenuBar = ({ editor }: { editor: Editor }) => {
    const ToggleButtons = [
        {
            icon: 'ri-arrow-left-line',
            title: 'Undo',
            action: () => editor.chain().focus().undo().run(),
        },
        {
            icon: 'ri-arrow-right-line',
            title: 'Redo',
            action: () => editor.chain().focus().redo().run(),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            icon: 'ri-bold',
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive('bold'),
        },
        {
            icon: 'ri-italic',
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive('italic'),
        },
        {
            icon: 'ri-underline',
            title: 'Underline',
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: () => editor.isActive('underline'),
        },
        {
            icon: 'ri-strikethrough',
            title: 'Strike',
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: () => editor.isActive('strike'),
        },
        {
            icon: 'ri-mark-pen-line',
            title: 'Highlight',
            action: () => editor.chain().focus().toggleHighlight().run(),
            isActive: () => editor.isActive('highlight'),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            icon: 'ri-h-1',
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
            icon: 'ri-h-2',
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
            icon: 'ri-paragraph',
            title: 'Paragraph',
            action: () => editor.chain().focus().setParagraph().run(),
            isActive: () => editor.isActive('paragraph'),
        },
        {
            icon: 'ri-list-unordered',
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive('bulletList'),
        },
        {
            icon: 'ri-list-ordered',
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive('orderedList'),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            icon: 'ri-format-clear',
            title: 'Clear Format',
            action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        },
        {
            icon: '',
            title: 'divider',
        },
    ]
    return (
        <div className='flex flex-row flex-nowrap justify-start content-center pb-4'>
            {ToggleButtons.map((item, index) => (
                <Fragment key={index}>
                    <TextEditorMenuItem {...item}></TextEditorMenuItem>
                </Fragment>
            ))}
            <FontCOlorSelection editor={editor}></FontCOlorSelection>
        </div>
    );
};

export default TextEditorMenuBar;
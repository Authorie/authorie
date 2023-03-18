import { Menu } from '@headlessui/react'

import type { Editor } from '@tiptap/react'

import { Fragment } from 'react'

const TableMenu = ({ editor }: { editor: Editor }) => {
    const tableItems = [
        {
            name: 'Insert table',
            icon: 'ri-add-circle-line',
            action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
        {
            name: 'Delete table',
            icon: 'ri-delete-bin-line',
            action: () => editor.chain().focus().deleteTable().run(),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            name: 'Insert column before',
            icon: 'ri-add-circle-line',
            action: () => editor.chain().focus().addColumnBefore().run(),
        },
        {
            name: 'Insert column after',
            icon: 'ri-add-circle-line',
            action: () => editor.chain().focus().addColumnAfter().run(),
        },
        {
            name: 'Insert row before',
            icon: 'ri-add-circle-line',
            action: () => editor.chain().focus().addRowBefore().run(),
        },
        {
            name: 'Insert row after',
            icon: 'ri-add-circle-line',
            action: () => editor.chain().focus().addRowAfter().run(),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            name: 'Delete column',
            icon: 'ri-delete-bin-line',
            action: () => editor.chain().focus().deleteColumn().run(),
        },
        {
            name: 'Delete row',
            icon: 'ri-delete-bin-line',
            action: () => editor.chain().focus().deleteRow().run(),
        },
        {
            icon: '',
            title: 'divider',
        },
        {
            name: 'Merge cells',
            icon: 'ri-merge-cells-horizontal',
            action: () => editor.chain().focus().mergeCells().run(),
        },
        {
            name: 'Split cell',
            icon: 'ri-ri-split-cells-horizontal',
            action: () => editor.chain().focus().splitCell().run(),
        },

    ]

    return (
        <div className='flex relative content-center'>
            <Menu>
                <Menu.Button className=' hover:bg-slate-100 rounded h-fit self-center p-1'>
                    <i className='ri-table-line'></i>
                </Menu.Button>
                <Menu.Items className='flex flex-col absolute translate-y-10 w-fit z-10 p-1 bg-white drop-shadow-lg rounded'>
                    {tableItems.map((item, index) => (
                        <Fragment key={index}>
                            <Menu.Item>
                                {item.title === 'divider' ? 
                                <div className="w-11/12 h-0.5 bg-slate-300 m-3 self-center"/> 
                                :
                                <button onClick={item.action}
                                    className={`flex rounded-md p-1 m-1 hover:bg-slate-200 whitespace-nowrap justify-content-start gap-1`}>
                                    <i className={`${item.icon}`}></i>
                                    {item.name}
                                </button>
                                }
                            </Menu.Item>
                        </Fragment>
                    ))}
                </Menu.Items>
            </Menu>
        </div>


    )
}

export default TableMenu;
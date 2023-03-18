import { Editor } from '@tiptap/react'
import { Popover } from '@headlessui/react'
import { ChangeEvent, useState } from 'react'

import 'remixicon/fonts/remixicon.css'

const LinkInputButton = ({ editor }: { editor: Editor }) => {
    const [InputUrl, setInputUrl] = useState({value: ''})
    const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        setInputUrl({value: e.target.value})
    }


    return (
        <Popover className="flex relative content-center">
            <Popover.Button className='hover:bg-slate-100 rounded h-fit self-center p-1'>
                <i className='ri-link'></i>
            </Popover.Button>

            <Popover.Panel className="absolute translate-y-10 z-10 p-1 bg-white drop-shadow-lg">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setLink({ href: InputUrl.value}).run()

                }}
                className='flex'>
                    <input className='w-50 focus:outline-none' 
                    type='url' placeholder='Paste link here'
                    onChange={handleChange}></input>
                    <input type='reset' value='X'></input>
                </form>

            </Popover.Panel>
        </Popover>
    )
}

export default LinkInputButton;
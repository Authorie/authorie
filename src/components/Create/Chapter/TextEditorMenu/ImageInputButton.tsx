import type { Editor } from '@tiptap/react'
import { Popover } from '@headlessui/react'
import { ChangeEvent, useState } from 'react'

import 'remixicon/fonts/remixicon.css'

const ImageInputButton = ({ editor }: { editor: Editor }) => {
    const [InputUrl, setInputUrl] = useState({ value: '' })
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputUrl({ value: e.target.value })
    }


    return (
        <Popover className="flex relative content-center">
            <Popover.Button className='hover:bg-slate-100 rounded h-fit self-center p-1'>
                <i className='ri-image-line'></i>
            </Popover.Button>

            <Popover.Panel className="flex flex-col absolute translate-y-10 z-10 p-1 bg-white drop-shadow-lg rounded">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setImage({ src: InputUrl.value }).run()

                }}
                    className='flex'>
                    <input className='w-50 focus:outline-none'
                        type='url' placeholder='Paste link here'
                        onChange={handleChange}></input>
                    <input type='reset' value='x' className='bold m-1'></input>
                </form>
                <input type='file' className='rounded-md p-1 m-1 hover:bg-slate-200'></input>
            </Popover.Panel>
        </Popover>
    )
}

export default ImageInputButton;
import { Listbox } from '@headlessui/react'
import { Editor } from '@tiptap/react';
import { useState } from 'react';

const FontColorSelection = ({ editor }: { editor: Editor }) => {
    const colors = [
        { id: 1, name: 'Black   ', value: '#000', tailwindcolor: 'black' },
        { id: 2, name: 'Red', value: '#ef4444', tailwindcolor: 'red-500' },
        { id: 3, name: 'Green', value: '#22c55e', tailwindcolor: 'green-500' },
        { id: 4, name: 'Blue', value: '#3b82f6', tailwindcolor: 'blue-500' },
    ]

    const [selectedColor, setSelectedColor] = useState(colors[0])

    const fontHandler = (color: {
        id: number;
        name: string;
        value: string;
        tailwindcolor: string;
    }) => {
        setSelectedColor(color)
        editor?.chain().focus().setColor(color.value).run()
    }

    const TempColorChecker = () => {
        for (const value in colors) {
            if (editor.isActive('textStyle', { color: colors[value]?.value })) return colors[value];
        }
    }

    return (
        <div className='flex relative'>
            <Listbox value={selectedColor} by='id' onChange={fontHandler}>
                <Listbox.Button onFocus={() => editor?.commands.focus()} className='rounded hover:bg-slate-200 p-2 h-fit w-fit place-self-center'>
                    <div className={`h-3 w-3 bg-${TempColorChecker()? TempColorChecker()?.tailwindcolor : 'black'} rounded`}></div>
                </Listbox.Button>
                <Listbox.Options className='flex absolute translate-y-10 z-10 rounded bg-white drop-shadow-lg'>
                    {colors.map((color) => (
                        <Listbox.Option
                            key={color.id}
                            value={color}
                            title={color.name}
                            className={`${editor.isActive('textStyle', { color: color.value }) ? 'bg-slate-300' : 'bg-white'} 
                            rounded-md p-2 m-1 h-7 hover:bg-slate-200`}
                        >
                            <div className={`bg-${color.tailwindcolor} h-3 w-3 rounded`}></div>
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    )
}

export default FontColorSelection;
import Image from "next/image"
import { EnvelopeIcon } from "@heroicons/react/24/outline"

export default function AuthorBanner() {
    return (
        <div className="flex flex-col gap-6 p-8 w-min bg-neutral-800/60 text-white backdrop-blur-md shadow-lg">
            <Image
                priority
                src="/favicon.ico"
                className="rounded-full w-52 h-52"
                height={144}
                width={144}
                alt={"name"}
            />
            <div className="flex items-center">
                <div className="font-bold text-4xl w-max">Lorem napkin</div>
                <div className="rounded-full bg-lime-300 w-5 h-5 mx-3 mt-3"></div>
                <EnvelopeIcon className="w-16 h-16 ml-16 mr-7"/>
                <div className="rounded-md bg-lime-300 text-slate-800/60 px-4 py-1">Followed</div>
            </div>
            <div className="">owner of the nine cats and the sentinel main, owner of the nine cats and the sentinel main</div>
            <div className="flex gap-6">
            <div className="font-bold">20 followers</div>
            <div className="font-bold">402 following</div>
            </div>
            <div className="flex gap-14 justify-between">
                <div>HOME</div>
                <div>COMMUNITY</div>
                <div>BOOK</div>
                <div>ABOUT</div>
            </div>
        </div>
    )
}


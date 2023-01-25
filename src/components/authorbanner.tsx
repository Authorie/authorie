import Image from "next/image"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import Link from 'next/link';

export default function AuthorBanner({
    username,
    profileImage,
    currentStatus,
    authorDescription,
    followers,
    following,
    page
}: {
    username: string,
    profileImage: string,
    currentStatus: boolean,
    authorDescription: string,
    followers: number,
    following: number,
    page: string
}) {
    const [followStatus, setfollowStatus] = useState(currentStatus)

    const pages = ["home", "community", "book", "about"]

    function handleFollow() {
        setfollowStatus(!followStatus)
    }

    return (
        <div className="flex flex-col gap-6 p-8 w-min bg-neutral-800/60 text-white backdrop-blur-md shadow-lg">
            <Image
                priority
                src={profileImage}
                className="rounded-full w-52 h-52"
                height={144}
                width={144}
                alt={"Missing Image"}
            />
            <div className="flex items-center">
                <div className="font-bold text-4xl w-max">{username}</div>
                <div className="rounded-full bg-lime-300 w-5 h-5 mx-3 mt-3"></div>
                <button><EnvelopeIcon className="w-16 h-16 ml-16 mr-7" /></button>
                <button className="rounded-md bg-lime-300 text-slate-800/60 px-4 py-1 w-24" onClick={handleFollow}>{followStatus ? "Followed" : "Follow"}</button>
            </div>
            <div className="">{authorDescription}</div>
            <div className="flex gap-6">
                <div className="font-bold">{followers} followers</div>
                <div className="font-bold">{following} following</div>
            </div>
            <ul className="flex gap-14 justify-between">
                {pages.map((pagenames) => (
                    <li key={page}>
                        <Link href={``} className={`${page == pagenames ? 'text-lime-300 underline' : 'hover:text-lime-300 hover:underline'
                            } leading-5 underline-offset-4 uppercase`}
                        >{pagenames}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}


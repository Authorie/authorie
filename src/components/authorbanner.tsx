import Image from "next/image"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import Link from 'next/link';
import { useRouter } from "next/router";

export default function AuthorBanner({
    username,
    onlineStatus,
    profileImage,
    initialFollowStatus,
    authorDescription,
    followers,
    following
}: {
    username: string,
    onlineStatus: boolean,
    profileImage: string,
    initialFollowStatus: boolean,
    authorDescription: string,
    followers: number,
    following: number
}) {
    const [followStatus, setfollowStatus] = useState(initialFollowStatus)

    const router = useRouter()

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
                <div className={`rounded-full w-5 h-5 mx-3 mt-3 ${onlineStatus ? "bg-lime-300":"bg-gray-300"}`}></div>
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
                    <li key={pagenames}>
                        <Link href={``} className={`${router.pathname.endsWith(pagenames) ? 'text-lime-300 underline' : 'hover:text-lime-300 hover:underline'
                            } leading-5 underline-offset-4 uppercase`}
                        >{pagenames}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}


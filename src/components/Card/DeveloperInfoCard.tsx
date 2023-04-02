import Image from "next/image";
import { HiEnvelope } from "react-icons/hi2";

type props = {
  name: string;
  img: string;
  position: string;
  quote: string;
  email: string;
};

const DeveloperInfoCard = ({ name, img, position, quote, email }: props) => {
  return (
    <div className="z-10 flex h-96 w-72 flex-col items-center justify-center bg-white pb-10 shadow-lg">
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="absolute top-0 -z-10 h-1/2 w-full bg-authGreen-500" />
        <div className="h-36 w-36 overflow-hidden rounded-full border-2 border-white">
          <Image src={img} alt={`${name}'s picture`} width={140} height={140} />
        </div>
      </div>
      <div className="flex flex-col items-center px-6">
        <p className="text-xs text-gray-600">{position}</p>
        <h1 className="my-2 text-xl font-semibold">{name}</h1>
        <p className="my-4 text-xs font-semibold">&quot;{quote}&quot;</p>
        <div className="mt-4 flex items-center gap-2">
          <HiEnvelope className="h-5 w-5" />
          <p className="text-xs">{email}</p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperInfoCard;

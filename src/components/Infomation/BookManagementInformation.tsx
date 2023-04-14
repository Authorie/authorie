import { HiOutlinePencilSquare } from "react-icons/hi2";
import Image from "next/image";

const BookManagementInformation = () => {
  return (
    <div className="flex flex-col items-start gap-8 text-gray-700">
      <div className="flex items-center gap-4">
        <p className="font-semibold">1. Click on</p>
        <HiOutlinePencilSquare className="h-6 w-6" />
      </div>
      <div className="flex gap-4">
        <p className="font-semibold">2. Drag chapter card</p>
        <Image
          src="/drag.png"
          alt="drag chapter card picture"
          width={350}
          height={250}
        />
      </div>
      <div className="flex gap-4">
        <p className="font-semibold">3. Drop chapter card</p>
        <Image
          src="/drop.png"
          alt="drop chapter card picture"
          width={230}
          height={150}
        />
      </div>
    </div>
  );
};

export default BookManagementInformation;

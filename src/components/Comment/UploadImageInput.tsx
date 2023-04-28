import Image from "next/image";
import { useState } from "react";
import useImageUpload from "~/hooks/imageUpload";
import LoadingSpinner from "../ui/LoadingSpinner";

type props = {
  onSubmit: (image: string) => void;
};

const UploadImageInput = ({ onSubmit }: props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { image, setImageHandler, resetImageData, uploadHandler } =
    useImageUpload();

  const submitHandler = async () => {
    setIsLoading(true);
    const commentImageUrl = await uploadHandler();
    setIsLoading(false);
    if (commentImageUrl) {
      onSubmit(commentImageUrl);
      resetImageData();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white p-2">
      <div className="flex h-64 w-72 items-center justify-center overflow-auto border">
        {image ? (
          <Image src={image} alt="Comment Image" width={300} height={300} />
        ) : (
          <div className="flex items-center justify-center rounded-lg font-semibold">
            Image size smaller than 5 GB
          </div>
        )}
      </div>
      <div className="grid w-full grid-cols-2 gap-2">
        <label
          htmlFor="upload-image"
          className="flex cursor-pointer items-center justify-center rounded-lg border bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-300"
        >
          <input
            id="upload-image"
            hidden
            type="file"
            accept="image/*"
            onChange={setImageHandler}
          />
          <p>Upload Image</p>
        </label>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void submitHandler()}
          className="cursor-pointer rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
        >
          {isLoading ? (
            <div className="grid items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            "Confirm"
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadImageInput;

import Image from "next/image";
import z from "zod";
import useImageUpload from "~/hooks/imageUpload";
import { api } from "~/utils/api";

type props = {
  onClick: (image: string) => void;
};

const UploadImageInput = ({ onClick }: props) => {
  const { imageData, uploadHandler, resetImageData } = useImageUpload();
  const uploadImage = api.upload.uploadImage.useMutation();

  const submitHandler = async () => {
    const urlParser = z.string().startsWith("data:image");
    if (imageData && urlParser.safeParse(imageData).success) {
      const commentImageUrl = await uploadImage.mutateAsync({
        image: imageData,
      });
      onClick(commentImageUrl)
      resetImageData();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white p-2">
      <div className="flex h-64 w-72 items-center justify-center overflow-auto border">
        {imageData ? (
          <Image src={imageData} alt="Comment Image" width={300} height={300} />
        ) : (
          <div className="flex items-center justify-center rounded-lg font-semibold">
            {`Image size < 1 mb`}
          </div>
        )}
      </div>
      <label
        htmlFor="upload-image"
        className="flex cursor-pointer items-center justify-center rounded-lg border px-2 py-1 text-gray-700 hover:bg-gray-200"
      >
        <input
          id="upload-image"
          hidden
          type="file"
          accept="image/jepg, image/png"
          onChange={uploadHandler}
        />
        <p>Upload Image</p>
      </label>
      <div
        className="cursor-pointer rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
        onClick={() => void submitHandler()}
      >
        Confirm
      </div>
    </div>
  );
};

export default UploadImageInput;

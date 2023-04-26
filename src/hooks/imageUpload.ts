import { useCallback, useState, type ChangeEvent, useEffect } from "react";
import { api } from "~/utils/api";

const useImageUpload = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const { mutateAsync: createPresignedUrl } =
    api.upload.createPresignedUrl.useMutation();

  useEffect(() => {
    const reader = new FileReader();
    const onLoadEnd = (readerEvent: ProgressEvent<FileReader>) => {
      if (
        readerEvent?.target?.result &&
        typeof readerEvent.target.result === "string"
      ) {
        setImageData(readerEvent.target.result);
      }
    };
    reader.addEventListener("loadend", onLoadEnd);
    if (image) {
      reader.readAsDataURL(image);
    }

    return () => {
      reader.removeEventListener("loadend", onLoadEnd);
    };
  }, [image]);

  const setImageHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      setImage(file);
    }
  }, []);

  const resetImageData = useCallback(() => {
    setImageData(null);
    setImage(null);
  }, []);

  const uploadHandler = useCallback(async () => {
    if (image === null) return undefined;
    const { presignedUrl, imageUrl } = await createPresignedUrl({
      type: image.type,
    });
    await fetch(presignedUrl, {
      mode: "cors",
      method: "PUT",
      body: image,
    });
    return imageUrl;
  }, [createPresignedUrl, image]);

  return {
    image: imageData,
    imageName: image?.name,
    setImageHandler,
    uploadHandler,
    resetImageData,
  };
};

export default useImageUpload;

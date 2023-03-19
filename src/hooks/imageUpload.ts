import { useState, useCallback, type ChangeEvent } from "react";

const convertToBase64 = (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return reader.result;
};

const useImageUpload = () => {
  const [imageData, setImageData] = useState("");
  const uploadHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      const base64 = convertToBase64(file);
      if (typeof base64 === "string") setImageData(base64);
    }
  }, []);

  return { imageData, uploadHandler };
};

export default useImageUpload;

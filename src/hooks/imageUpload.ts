import { useCallback, useState, type ChangeEvent } from "react";

const useImageUpload = () => {
  const [imageData, setImageData] = useState("");
  const uploadHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64 = reader.result;
        if (typeof base64 === "string") setImageData(base64);
      };
    }
  }, []);
  return { imageData, uploadHandler, setImageData };
};

export default useImageUpload;

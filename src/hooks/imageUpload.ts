import { useState, useCallback, type ChangeEvent } from "react";

const useImageUpload = () => {
  const [imageData, setImageData] = useState("");
  const uploadHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result?.toString() as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetImageData = useCallback(() => {
    setImageData("");
  }, []);

  return { imageData, uploadHandler, resetImageData };
};

export default useImageUpload;

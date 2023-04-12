import { useCallback, useState, type ChangeEvent } from "react";

const useImageUpload = () => {
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
  const uploadHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      setImageName(file?.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageData(reader.result?.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetImageData = useCallback(() => {
    setImageData("");
    setImageName("");
  }, []);

  return { imageData, imageName, uploadHandler, resetImageData };
};

export default useImageUpload;

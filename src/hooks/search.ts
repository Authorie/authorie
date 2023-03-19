import { env } from "@env/client.mjs";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [enableSearch, setEnableSearch] = useState(false);
  useEffect(() => {
    setEnableSearch(false);
    const delayDebounceFn = setTimeout(() => {
      setEnableSearch(true);
    }, env.NEXT_PUBLIC_BOUNCE_DELAY_MILLISECONDS);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  const searchTermChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  return { searchTerm, enableSearch, searchTermChangeHandler };
};

export default useSearch;

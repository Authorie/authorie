import { useEffect } from "react";
import toast from "react-hot-toast";
import type { InfiniteQueryObserverResult } from "@tanstack/react-query";

interface MyScrollingElement extends HTMLElement {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

const useInfiniteScroll = (
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>,
  hasNextPage: boolean | undefined
) => {
  useEffect(() => {
    let fetching = false;
    const handleScroll = (e: Event) => {
      const target = e.target as EventTarget & {
        scrollingElement: MyScrollingElement;
      };
      const { scrollHeight, scrollTop, clientHeight } = target.scrollingElement;
      if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.2) {
        fetching = true;
        if (hasNextPage)
          fetchNextPage()
            .then(() => {
              fetching = false;
            })
            .catch(() => {
              toast.error("Something went wrong");
            });
      }
    };
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage, hasNextPage]);
};

export default useInfiniteScroll;

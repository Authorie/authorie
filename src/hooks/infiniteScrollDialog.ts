import { useEffect } from "react";
import type { InfiniteQueryObserverResult } from "@tanstack/react-query";

type Props = {
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
  hasNextPage: boolean | undefined;
  scrollableId: string;
};

const useInfiniteScrollDialog = ({
  fetchNextPage,
  hasNextPage,
  scrollableId,
}: Props) => {
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const { scrollHeight, scrollTop, clientHeight } = target;

      if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasNextPage) {
        fetchNextPage().catch(() => {
          console.error("Error fetching next page");
        });
      }
    };
    const scrollableElement = document.getElementById(scrollableId);
    if (scrollableElement) {
      scrollableElement.addEventListener("scroll", handleScroll);
      return () => {
        scrollableElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [fetchNextPage, hasNextPage, scrollableId]);
};

export default useInfiniteScrollDialog;

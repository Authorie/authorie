import type { InfiniteQueryObserverResult } from "@tanstack/react-query";
import { useEffect } from "react";

type Props = {
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
  hasNextPage: boolean | undefined;
  scrollableId: string | null;
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
    if (!scrollableId) return;
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

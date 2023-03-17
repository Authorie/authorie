interface paginationItem {
  id: string;
}

export function makePagination<T extends paginationItem>(
  items: T[],
  limit: number
): {
  items: T[];
  nextCursor?: string;
} {
  let nextCursor: string | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items,
    nextCursor,
  };
}

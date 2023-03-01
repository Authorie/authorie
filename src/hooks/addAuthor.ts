import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CreateBookStore = {
  authorList: string[];
  addAuthor: (author: string) => void;
  deleteAuthor: (author: string) => void;
};

const useAuthorStore = create<CreateBookStore>()(
  devtools((set) => ({
    authorList: [],
    addAuthor: (author) =>
      set((state) => {
        if (state.authorList.includes(author)) {
          return state;
        }
        return {
          ...state,
          authorList: [...state.authorList, author],
        };
      }),
    deleteAuthor: (author) =>
      set((state) => {
        return {
          ...state,
          authorList: state.authorList.filter((c) => c != author),
        };
      }),
  }))
);

export const useAuthorList = () => useAuthorStore((state) => state.authorList);
export const useAddAuthor = () => useAuthorStore((state) => state.addAuthor);
export const useDeleteAuthor = () =>
  useAuthorStore((state) => state.deleteAuthor);

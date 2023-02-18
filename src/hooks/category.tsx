import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Category } from "@prisma/client";

type CategoryStore = {
  selectedCategory: "following" | Category;
  selectCategory: (category: "following" | Category) => void;
};

const useCategoryStore = create<CategoryStore>()(
  devtools(
    persist(
      (set) => ({
        selectedCategory: "following",
        selectCategory: (category) =>
          set(() => ({ selectedCategory: category })),
      }),
      {
        name: "following-storage",
      }
    )
  )
);

export const useSelectedCategory = () =>
  useCategoryStore((state) => state.selectedCategory);
export const useSelectCategory = () =>
  useCategoryStore((state) => state.selectCategory);

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Category } from "@prisma/client";

type SelectedCategoryStore = {
  selectedCategory: "all" | "following" | Category;
  selectCategory: (category: "all" | "following" | Category) => void;
};

const useSelectedCategoryStore = create<SelectedCategoryStore>()(
  devtools((set) => ({
    selectedCategory: "all",
    selectCategory: (category) => set(() => ({ selectedCategory: category })),
  }))
);

export const useSelectedCategory = () =>
  useSelectedCategoryStore((state) => state.selectedCategory);
export const useSelectCategory = () =>
  useSelectedCategoryStore((state) => state.selectCategory);

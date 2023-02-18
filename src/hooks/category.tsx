import { create } from "zustand";
import { api } from "@utils/api";
import { Category } from ".prisma/client";

type CategoryStore = {
  selectedCategory: "following" | Category;
  actions: {
    selectCategory: (category: "following" | Category) => void;
  };
};

const useCategoryStore = create<CategoryStore>()((set) => ({
  selectedCategory: "following",
  actions: {
    selectCategory: (category) => set({ selectedCategory: category }),
  },
}));

export const useSelectedCategory = () =>
  useCategoryStore((state) => state.selectedCategory);
export const useSelectCategory = () =>
  useCategoryStore((state) => state.actions.selectCategory);

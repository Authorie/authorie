import type { Category } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type FollowedCategoriesStore = {
  followedCategories: Category[];
  setFollowedCategories: (categories: Category[]) => void;
  followCategory: (category: Category) => void; // use for non-user
  unfollowCategory: (category: Category) => void; // use for non-user
};

const useFollowedCategoriesStore = create<FollowedCategoriesStore>()(
  devtools((set) => ({
    followedCategories: [],
    setFollowedCategories: (categories) =>
      set(() => ({ followedCategories: categories })),
    followCategory: (category) =>
      set((state) => {
        if (state.followedCategories.includes(category)) {
          return state;
        }
        return {
          ...state,
          followedCategories: [...state.followedCategories, category],
        };
      }),
    unfollowCategory: (category) =>
      set((state) => {
        return {
          ...state,
          followedCategories: state.followedCategories.filter(
            (c) => c != category
          ),
        };
      }),
  }))
);

export const useFollowedCategories = () =>
  useFollowedCategoriesStore((state) => state.followedCategories);
export const useSetFollowedCategories = () =>
  useFollowedCategoriesStore((state) => state.setFollowedCategories);
export const useFollowCategory = () =>
  useFollowedCategoriesStore((state) => state.followCategory);
export const useUnfollowCategory = () =>
  useFollowedCategoriesStore((state) => state.unfollowCategory);

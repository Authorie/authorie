import type { RouterOutputs } from "@utils/api";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type RouterUser = RouterOutputs["user"]["getData"];

type UserStore = {
  user: RouterUser | null;
  setUser: (user: RouterUser | null) => void;
};

const useUserStore = create<UserStore>()(
  devtools((set) => ({
    user: null,
    setUser: (user) => set(() => ({ user })),
  }))
);

export const useUser = () => useUserStore((state) => state.user);
export const useSetUser = () => useUserStore((state) => state.setUser);

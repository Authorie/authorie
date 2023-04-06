import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SelectedDateStore = {
  selectedDate: Date;
  selectDate: (date: Date | undefined) => void;
};

const useSelectedDateStore = create<SelectedDateStore>()(
  devtools((set) => ({
    selectedDate: new Date(),
    selectDate: (date: Date | undefined) =>
      set(() => ({ selectedDate: date || new Date() })),
  }))
);

export const useSelectedDate = () =>
  useSelectedDateStore((state) => state.selectedDate);
export const useSelectDate = () =>
  useSelectedDateStore((state) => state.selectDate);

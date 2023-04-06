import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SelectedDateStore = {
  selectedDate: Date;
  selectDate: (date: Date | undefined) => void;
};

const currentDate = new Date();

const useSelectedDateStore = create<SelectedDateStore>()(
  devtools((set) => ({
    selectedDate: currentDate,
    selectDate: (date: Date | undefined) =>
      set(() => ({ selectedDate: date || currentDate })),
  }))
);

export const useSelectedDate = () =>
  useSelectedDateStore((state) => state.selectedDate);
export const useSelectDate = () =>
  useSelectedDateStore((state) => state.selectDate);

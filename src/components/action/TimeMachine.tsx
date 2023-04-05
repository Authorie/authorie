import { Popover } from "@headlessui/react";
import { HiCalendar } from "react-icons/hi2";
import DateInput from "@components/DateTimeInput/DateInput";
import { useState } from "react";
import dayjs from "dayjs";

type props = {
  refetchFeed: (date: Date) => void;
};

export const TimeMachine = ({ refetchFeed }: props) => {
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState({ isError: false, message: "" });

  const setDatetimeHandler = (unit: dayjs.UnitType, value: number) => {
    setDate((prev) => {
      const date = dayjs(prev).set(unit, value);
      if (!date.isValid()) return prev;
      return date.toDate();
    });
  };

  const submitHandler = () => {
    const now = new Date();
    const isValid = dayjs(date).isValid();
    const isFuture = dayjs(now).isAfter(date);
    if (!isValid) {
      setError({ isError: true, message: "Invalid date" });
      return;
    } else if (!isFuture) {
      setError({ isError: true, message: "Date must be in the past" });
      return;
    } else {
      setError({ isError: false, message: "" });
    }
    refetchFeed(date);
  };
  return (
    <Popover className="h-full">
      <Popover.Panel className="absolute right-4 top-14 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-200 p-3 shadow-lg">
        {({ close }) => (
          <>
            <DateInput
              datetime={date}
              setDay={(value: number) => setDatetimeHandler("date", value)}
              setMonth={(value: number) =>
                setDatetimeHandler("month", value - 1)
              }
              setYear={(value: number) => setDatetimeHandler("year", value)}
              min={2023}
              max
            />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => close()}
                className="rounded-lg border border-gray-500 px-2 py-1 text-xs text-gray-500 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitHandler}
                className="rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
            {error.isError && (
              <p className="text-xs text-red-400">{error.message}</p>
            )}
          </>
        )}
      </Popover.Panel>
      <Popover.Button className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-black outline-none hover:bg-gray-200 focus:outline-none">
        <HiCalendar className="h-5 w-5" />
        <p>Time Machine</p>
      </Popover.Button>
    </Popover>
  );
};

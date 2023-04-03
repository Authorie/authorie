import React, { useRef } from "react";

type props = {
  getDay: (value: string) => void;
  getMonth: (value: string) => void;
  getYear: (value: string) => void;
  date: { day: string; month: string; year: string };
};

const DateInput = ({ getDay, getMonth, getYear, date }: props) => {
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 2 && !isNaN(Number(value))) {
      getDay(value);
      if (value.length === 2) {
        monthRef.current?.focus();
      }
    } else {
      getDay("");
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 2 && !isNaN(Number(value)) && Number(value) <= 12) {
      getMonth(value);
      if (value.length === 2) {
        yearRef.current?.focus();
      }
    } else {
      getMonth("");
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 4 && !isNaN(Number(value))) {
      getYear(value);
    } else {
      getYear("");
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Day</p>
        <input
          value={date.day}
          className="w-10 rounded-lg p-1 text-center text-lg font-semibold outline-none focus:outline-none"
          type="text"
          onChange={handleDayChange}
          maxLength={2}
          placeholder="DD"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Month</p>
        <input
          value={date.month}
          className="w-10 rounded-lg p-1 text-center text-lg  font-semibold outline-none focus:outline-none"
          type="text"
          onChange={handleMonthChange}
          maxLength={2}
          ref={monthRef}
          placeholder="MM"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Year</p>
        <input
          value={date.year}
          className="w-16 rounded-lg p-1 text-center text-lg  font-semibold outline-none focus:outline-none"
          type="text"
          onChange={handleYearChange}
          maxLength={4}
          ref={yearRef}
          placeholder="YYYY"
        />
      </div>
    </div>
  );
};

export default DateInput;

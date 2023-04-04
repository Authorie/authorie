import dayjs from "dayjs";
import React from "react";

type props = {
  datetime: Date;
  setDay: (value: number) => void;
  setMonth: (value: number) => void;
  setYear: (value: number) => void;
};

const DateInput = ({ setDay, setMonth, setYear, datetime }: props) => {
  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const day = parseInt(event.target.value);
    if (!isNaN(day)) {
      if (day > dayjs(datetime).daysInMonth()) {
        setDay(1);
      } else if (day < 1) {
        setDay(dayjs(datetime).daysInMonth());
      } else {
        setDay(day);
      }
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const month = parseInt(event.target.value);
    if (!isNaN(month)) {
      if (month > 12) {
        setMonth(1);
      } else if (month < 1) {
        setMonth(12);
      } else {
        setMonth(month);
      }
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value);
    if (!isNaN(year)) {
      setYear(year);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Day</p>
        <input
          value={dayjs(datetime).date()}
          className="w-12 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
          type="number"
          onChange={handleDayChange}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Month</p>
        <input
          value={dayjs(datetime).month() + 1}
          className="w-12 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
          type="number"
          onChange={handleMonthChange}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-light">Year</p>
        <input
          value={dayjs(datetime).year()}
          className="w-16 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
          type="number"
          onChange={handleYearChange}
          min={dayjs().year()}
        />
      </div>
    </div>
  );
};

export default DateInput;

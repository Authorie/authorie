import DateInput from "@components/DateTimeInput/DateInput";
import TimeInput from "@components/DateTimeInput/TimeInput";
import dayjs from "dayjs";
import { useState } from "react";

type props = {
  onSubmit: (data: Date) => void;
  label: string;
};

const DateTimeInputField = ({ onSubmit, label }: props) => {
  const [datetime, setDatetime] = useState(new Date());
  const [error, setError] = useState({ isError: false, message: "" });

  const setDatetimeHandler = (unit: dayjs.UnitType, value: number) => {
    setDatetime((prev) => {
      const date = dayjs(prev).set(unit, value);
      if (!date.isValid()) return prev;
      return date.toDate();
    });
  };

  const submitHandler = () => {
    const now = new Date();
    const isValid = dayjs(datetime).isValid();
    const isPast = dayjs(now).isBefore(datetime);
    if (!isValid) {
      setError({ isError: true, message: "Invalid date" });
      return;
    } else if (!isPast) {
      setError({ isError: true, message: "Date must be in the future" });
      return;
    } else {
      setError({ isError: false, message: "" });
      onSubmit(datetime);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-slate-100 p-5">
      <div className="flex items-end gap-4">
        <DateInput
          datetime={datetime}
          setDay={(value: number) => setDatetimeHandler("date", value)}
          setMonth={(value: number) => setDatetimeHandler("month", value - 1)}
          setYear={(value: number) => setDatetimeHandler("year", value)}
        />
        <TimeInput
          datetime={datetime}
          setHour={(value: number) => setDatetimeHandler("hour", value)}
          setMinute={(value: number) => setDatetimeHandler("minute", value)}
        />
      </div>
      {error.isError && <p className="text-sm text-red-400">{error.message}</p>}
      <div className="flex justify-center">
        <button
          className="rounded-xl bg-blue-600 px-8 py-1 text-sm font-semibold text-white hover:bg-blue-800"
          onClick={submitHandler}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default DateTimeInputField;

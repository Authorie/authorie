import DateInput from "@components/DateTimeInput/DateInput";
import { useState } from "react";
import { isValid, parse, isPast } from "date-fns";
import TimeInput from "@components/DateTimeInput/TimeInput";

type props = {
  onSubmit: (data: string) => void;
  label: string;
};

const DateTimeInputField = ({ onSubmit, label }: props) => {
  const [date, setDate] = useState({ day: "", month: "", year: "" });
  const [time, setTime] = useState({ hours: "", minutes: "", ampm: "am" });
  const [error, setError] = useState({ isError: false, message: "" });
  const [result, setResult] = useState("");

  const getDayHandler = (value: string) => {
    setDate((prev) => ({ ...prev, day: value }));
  };

  const getMonthHandler = (value: string) => {
    setDate((prev) => ({ ...prev, month: value }));
  };

  const getYearHandler = (value: string) => {
    setDate((prev) => ({ ...prev, year: value }));
  };

  const getHourHandler = (value: string) => {
    setTime((prev) => ({ ...prev, hours: value }));
  };

  const getMinuteHandler = (value: string) => {
    setTime((prev) => ({ ...prev, minutes: value }));
  };

  const getAmpmHandler = (value: string) => {
    setTime((prev) => ({ ...prev, ampm: value }));
  };

  const submitHandler = () => {
    const dateValue = `${date.year}-${date.month}-${date.day}`;
    const dateResult = parse(dateValue, "yyyy-MM-dd", new Date());
    const validTime =
      time.hours !== "" && time.minutes !== "" && time.ampm !== "";
    if (!validTime && !isValid(dateResult)) {
      setError({ isError: true, message: "please input valid date and time" });
      return;
    } else if (!validTime) {
      setError({ isError: true, message: "please input valid time" });
    } else if (!isValid(dateResult)) {
      setError({ isError: true, message: "please input valid date" });
    } else if (isPast(dateResult)) {
      setError({ isError: true, message: "Cannot input the past date" });
    } else {
      setResult(dateValue + " " + `${time.hours}:${time.minutes} ${time.ampm}`);
      setError({ isError: false, message: "" });
      onSubmit(result);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-10">
      <div className="flex items-end gap-4">
        <DateInput
          getDay={getDayHandler}
          getMonth={getMonthHandler}
          getYear={getYearHandler}
          date={date}
        />
        <TimeInput
          getHour={getHourHandler}
          getMinute={getMinuteHandler}
          getAmpm={getAmpmHandler}
          time={time}
        />
      </div>
      {error.isError && <p className="text-sm text-red-400">{error.message}</p>}
      <div className="flex justify-center">
        <button
          className="rounded-xl bg-blue-600 px-8 py-1 font-semibold text-white hover:bg-blue-700"
          onClick={submitHandler}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default DateTimeInputField;

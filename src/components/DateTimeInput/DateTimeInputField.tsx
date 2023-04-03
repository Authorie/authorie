import DateInput from "@components/DateTimeInput/DateInput";
import { useState, useEffect } from "react";
import { isValid, parse, isBefore } from "date-fns";
import TimeInput from "@components/DateTimeInput/TimeInput";
import { format } from "date-fns";

type props = {
  onSubmit: (data: Date) => void;
  label: string;
};

const DateTimeInputField = ({ onSubmit, label }: props) => {
  const [date, setDate] = useState({
    day: format(new Date().getDate(), "dd").toString(),
    month: format(new Date().getMonth() + 1, "MM").toString(),
    year: new Date().getFullYear().toString(),
  });
  const [time, setTime] = useState({
    hours: format(new Date().getHours(), "hh").toString(),
    minutes: format(new Date().getMinutes(), "mm").toString(),
    ampm: "am",
  });

  useEffect(() => {
    const now = new Date();
    setDate((prev) => ({
      ...prev,
      day: format(now, "dd"),
      month: format(now, "MM"),
    }));
    setTime(() => ({
      hours: format(now, "hh"),
      minutes: format(now, "mm"),
      ampm:
        now
          .toLocaleString("en-US", { hour: "numeric", hour12: true })
          ?.split(" ")[1]
          ?.toLowerCase() || "am",
    }));
  }, []);
  const [error, setError] = useState({ isError: false, message: "" });

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
    const resultDateTime =
      dateValue + " " + `${time.hours}:${time.minutes} ${time.ampm}`;
    const dateObject = parse(resultDateTime, "yyyy-MM-dd hh:mm a", new Date());
    const now = new Date();
    const timeZone = "Asia/Bangkok";
    const options = { timeZone };
    const thailandTime = new Date(
      Date.parse(now.toLocaleString("en-US", options))
    );
    const isPast = isBefore(dateObject, thailandTime);
    const validTime =
      time.hours !== "" && time.minutes !== "" && time.ampm !== "";
    if (!validTime && !isValid(dateResult)) {
      setError({ isError: true, message: "please input valid date and time" });
      return;
    } else if (!validTime) {
      setError({ isError: true, message: "please input valid time" });
    } else if (!isValid(dateResult)) {
      setError({ isError: true, message: "please input valid date" });
    } else if (isPast) {
      setError({ isError: true, message: "Cannot input the past date" });
    } else {
      setError({ isError: false, message: "" });
      onSubmit(dateObject);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-slate-100 p-5">
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

import React, { useRef } from "react";

type props = {
  getHour: (value: string) => void;
  getMinute: (value: string) => void;
  getAmpm: (value: string) => void;
  time: { hours: string; minutes: string; ampm: string };
};

const TimeInput = ({ getHour, getMinute, getAmpm, time }: props) => {
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && Number(value) <= 12) {
      getHour(value);
      if (value && value.length === 2) {
        minuteInputRef.current?.focus();
      }
    } else {
      getHour("");
    }
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && Number(value) <= 59) {
      getMinute(value);
    } else {
      getMinute("");
    }
  };

  const handleAmPmChange = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string
  ) => {
    event.preventDefault();
    getAmpm(value);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          className="w-10 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
          type="text"
          value={time.hours}
          onChange={handleHoursChange}
          maxLength={2}
          ref={hourInputRef}
          placeholder="00"
        />
        <p className="font-semibold">:</p>
        <input
          className="w-10 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
          type="text"
          value={time.minutes}
          onChange={handleMinutesChange}
          maxLength={2}
          ref={minuteInputRef}
          placeholder="00"
        />
        <div className="flex gap-1">
          <button
            className={`rounded-lg ${
              time.ampm === "am" ? "bg-dark-300" : "hover:bg-dark-200"
            } px-2 py-1`}
            onClick={(event) => handleAmPmChange(event, "am")}
          >
            AM
          </button>
          <button
            className={`rounded-lg ${
              time.ampm === "pm" ? "bg-dark-300" : "hover:bg-dark-200"
            } px-2 py-1`}
            onClick={(event) => handleAmPmChange(event, "pm")}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeInput;

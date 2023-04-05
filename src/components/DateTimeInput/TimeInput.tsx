import dayjs from "dayjs";
import { type ChangeEvent } from "react";

type props = {
  datetime: Date;
  setHour: (value: number) => void;
  setMinute: (value: number) => void;
};

const TimeInput = ({ setHour, setMinute, datetime }: props) => {
  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(event.target.value);
    if (!isNaN(hours)) {
      if (hours > 23) {
        setHour(0);
      } else if (hours < 0) {
        setHour(23);
      } else {
        setHour(hours);
      }
    }
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(event.target.value);
    if (!isNaN(minutes)) {
      if (minutes > 59) {
        setMinute(0);
      } else if (minutes < 0) {
        setMinute(59);
      } else {
        setMinute(minutes);
      }
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-light">Hour</p>
          <input
            className="w-12 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
            type="number"
            value={dayjs(datetime).format("HH")}
            onChange={handleHoursChange}
          />
        </div>
        <p className="mb-1 font-semibold">:</p>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-light">Minute</p>
          <input
            className="w-12 rounded-lg p-1 text-center font-semibold outline-none focus:outline-none"
            type="number"
            value={dayjs(datetime).format("mm")}
            onChange={handleMinutesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeInput;

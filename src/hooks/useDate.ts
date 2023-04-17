import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DateOptions {
  withTime?: boolean;
}

const useDate = (
  date: Date | undefined,
  options?: DateOptions,
  globalFormat?: string
) => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (date) {
      const now = dayjs();
      const targetDate = dayjs(date);
      const diff = targetDate.diff(now, "months");

      if (Math.abs(diff) < 1) {
        setFormattedDate(targetDate.fromNow());
      } else {
        if (Math.abs(diff) < 12) {
          const format = options?.withTime
            ? "DD/MM/YYYY HH:mm"
            : "MMMM D [at] h:mm A";
          setFormattedDate(targetDate.format(format));
        } else {
          const format = options?.withTime
            ? "DD/MM/YYYY HH:mm"
            : "MMMM D YYYY [at] h:mm A";
          setFormattedDate(targetDate.format(format));
        }
      }
    } else {
      setFormattedDate("");
    }
  }, [date, options, globalFormat]);

  return formattedDate || (globalFormat ? dayjs().format(globalFormat) : "");
};

export default useDate;

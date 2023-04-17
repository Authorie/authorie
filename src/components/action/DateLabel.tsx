import dayjs from "dayjs";
import useDate from "~/hooks/useDate";

type props = {
  date: Date;
  withTime: boolean;
  publishedLabel?: boolean;
  chapterCard?: boolean;
  hover?: boolean;
  color?: string;
};

export const DateLabel = ({
  date,
  withTime,
  publishedLabel,
  chapterCard,
  hover,
  color,
}: props) => {
  const formattedDate = useDate(
    date || undefined,
    { withTime: withTime },
    "DD/MM/YYYY"
  );
  return (
    <>
      {chapterCard ? (
        <p
          className={`text-xs font-extralight text-${
            color ? color : "gray-500"
          }`}
        >
          published : {formattedDate}
        </p>
      ) : (
        <div className="group/date relative cursor-pointer ">
          <p className={`text-sm text-${color ? color : "gray-500"}`}>
            {publishedLabel && "published : "}
            {formattedDate}
          </p>
          {hover && (
            <div className="invisible absolute left-0 top-5 z-20 w-52 rounded-lg bg-black/70 py-2 text-center text-xs font-semibold text-white group-hover/date:visible">
              {dayjs(date).format("dddd, D MMMM YYYY [at] HH:mm")}
            </div>
          )}
        </div>
      )}
    </>
  );
};

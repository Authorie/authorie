import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const TimeMachine = () => {
  return (
    <>
      <button className="flex items-center gap-2 rounded-full bg-white px-3 py-1 hover:bg-dark-200">
        <CalendarDaysIcon className="h-6 w-auto" />
        <span className="text-sm font-bold">Time Machine</span>
      </button>
    </>
  );
};

export default TimeMachine;

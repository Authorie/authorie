import TextareaAutoSize from "react-textarea-autosize";

const ReportPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-authGreen-200">
      <h1 className="text-3xl font-bold">Report or Feedback</h1>
      <p className="my-4 w-2/5">
        If you find any bugs or have some suggestion to our website. Feel free
        to do it! Your report would benefit us and make Authorie become better.
        <span className="font-semibold">Thank you in advance! 🙏</span>
      </p>
      <div className="flex flex-col items-end gap-4">
        <div className="flex items-center gap-2">
          <label className="text-lg font-semibold">Email: </label>
          <input className="w-96 rounded-lg bg-slate-100 p-2 outline-none focus:outline-none" />
        </div>
        <div className="flex items-start gap-2">
          <label className="text-lg font-semibold">Report: </label>
          <TextareaAutoSize className="h-40 w-96 resize-none rounded-lg bg-slate-100 p-2 outline-none focus:outline-none" />
        </div>
      </div>
      <button className="mt-10 rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600">
        Submit response
      </button>
    </div>
  );
};

export default ReportPage;

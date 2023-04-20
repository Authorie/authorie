import TextareaAutoSize from "react-textarea-autosize";

const ReportPage = () => {
  return (
    <div className="flex max-h-fit min-h-screen flex-col items-center justify-center bg-authGreen-200 py-44">
      <h1 className="text-3xl font-bold">Report or Feedback</h1>
      <p className="my-4 w-3/5">
        If you find any bugs or have some suggestion to our website, or find
        some content of other users that include any harmful or offensive
        material, feel free to give us all the details and we will take care of
        it. Your report would benefit us and let us make Authorie and our
        community become better.
        <span className="font-semibold">Thank you in advance! 🙏</span>
      </p>
      <div className="flex w-1/2 flex-col items-start gap-6">
        <div className="flex w-full items-center gap-2">
          <label className="mr-3 text-lg font-semibold">Email: </label>
          <input className="w-full rounded-lg bg-slate-100 p-2 outline-none focus:outline-none" />
        </div>
        <div className="flex w-full items-start gap-2">
          <label className="text-lg font-semibold">Report: </label>
          <TextareaAutoSize
            minRows={5}
            className="w-full resize-none rounded-lg bg-slate-100 p-2 outline-none focus:outline-none"
          />
        </div>
      </div>
      <button className="mt-10 rounded-lg bg-blue-500 px-4 py-1 text-white hover:bg-blue-600">
        Submit response
      </button>
    </div>
  );
};

export default ReportPage;

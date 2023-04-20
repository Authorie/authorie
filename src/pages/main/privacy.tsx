import Image from "next/image";

const PrivacyPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="grid h-3/4 w-3/5 grid-cols-2 rounded-xl bg-slate-50 ">
        <div className="flex items-center justify-center rounded-l-lg bg-authGreen-200">
          <p className="text-5xl font-bold">Privacy</p>
        </div>
        <div className="flex items-center justify-center px-4">
          <h1 className="text-center text-lg font-bold text-black">
            We will keep all your draft, saved, published, archived data into
            our database so that all your data will not be lost and stay in our
            website forever. Nevertheless, we will not share or sell your data
            anywhere and you are allowed to archive your data or content so that
            the public will not see it.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

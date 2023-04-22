const PrivacyPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex w-3/5 flex-col rounded-xl bg-slate-100 ">
        <div className="flex items-center justify-center rounded-t-lg bg-authGreen-400 py-6">
          <p className="text-5xl font-bold">Privacy</p>
        </div>
        <div className="flex items-center justify-center px-4 py-20">
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

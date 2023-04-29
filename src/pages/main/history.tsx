const HistoryPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="grid h-3/4 w-3/5 grid-cols-2 rounded-xl bg-gray-300 ">
        <div className="flex items-center justify-center rounded-l-lg bg-authGreen-400">
          <p className="text-5xl font-bold">History</p>
        </div>
        <div className="flex flex-col justify-center gap-5 px-4">
          <p className=" text-sm font-semibold text-black">
            &quot;Authorie get inspired from Mr. Sataporn Ngarmruengpong and
            Yoyoway. I read their posts on one website and think that it would
            be great if I can read all their posts. However, it is not possible
            because there are so many posts and it is pretty troublesome to
            scroll all the way to the bottom. Thus, I think it would be cool if
            there is a website which you can manage and read each posts easily.
            Consequently, I come up with an idea to create a website where you
            can create books and chapters, which you can write down all your
            journey there. Finally, I invited my friends to create this website
            with me for our senior project.&quot;
          </p>
          <p className="text-right text-sm font-bold text-black">
            - Supakit Kuewsupakorn
          </p>
          <p className="text-right text-xs font-bold text-black">22/04/2023</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

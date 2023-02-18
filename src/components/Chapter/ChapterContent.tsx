const ChapterContent = () => {
  return (
    <div className="w-[1100px] rounded-xl bg-white shadow-lg">
      <div className="mb-3 flex flex-col gap-1 rounded-t-xl bg-gradient-to-l from-amber-400 px-20 pb-5 pt-8">
        <h1 className="text-3xl font-bold">A Dusk Delusion</h1>
        <h3 className="text-2xl font-bold text-black">
          <span className="text-dark-400">chapter 1</span> : Ordinary days
        </h3>
        <p className="text-xs text-dark-400">publish: 11 November, 2022</p>
      </div>
      <div className="px-20 pt-2">
        <p className="font-semibold">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tellus cras
          tristique tempus auctor nunc iaculis pharetra
        </p>
        <br />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tellus cras
          tristique tempus auctor nunc iaculis pharetra, amet est. Id fermentum,
          varius donec blandit dignissim pellentesque dui feugiat gravida. Urna
          neque turpis sapien aliquam purus nibh cursus velit. Nec nec non morbi
          tristique vivamus
        </p>
        <button className="font-bold">read more</button>
      </div>
      <div className="flex justify-between px-20 py-7">
        <button>22 likes</button>
        <button>15 comment</button>
        <div className="flex gap-3">
          <button>22 share</button>
          <button>...</button>
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;

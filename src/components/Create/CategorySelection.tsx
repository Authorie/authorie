import { api } from "@utils/api";

const CategorySelection = () => {
  const { data: categories } = api.category.getAll.useQuery();
  return (
    <div className="grid w-max grid-cols-3 gap-4 rounded-xl bg-gray-200 p-2">
      {categories?.map((data) => (
        <div
          key={data.id}
          className="flex h-6 w-40 cursor-pointer items-center justify-center rounded-lg bg-slate-400 text-xs text-white hover:bg-slate-600"
        >
          {data.title}
        </div>
      ))}
    </div>
  );
};

export default CategorySelection;

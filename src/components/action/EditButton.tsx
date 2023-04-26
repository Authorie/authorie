import { HiOutlinePencilSquare } from "react-icons/hi2";

type props = {
  onEdit: () => void;
  isOwner: boolean;
  reset: () => void;
  isEdit: boolean;
  formId: string;
};

export const EditButton = ({
  onEdit,
  isOwner,
  reset,
  isEdit,
  formId,
}: props) => {
  return (
    <>
      <button type="button" onClick={onEdit} className="cursor-pointer">
        {!isEdit && (
          <HiOutlinePencilSquare
            className={`h-8 w-8 ${
              isOwner ? "rounded-lg text-gray-800 hover:bg-gray-300" : "hidden"
            }`}
          />
        )}
      </button>
      {isEdit && (
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-red-500 px-5 py-1 text-white outline-none hover:bg-red-600 hover:text-white focus:outline-none"
          >
            Cancel
          </button>
          <button
            form={formId}
            type="submit"
            className="rounded-xl bg-blue-500 px-5 py-1 font-semibold text-white outline-none hover:bg-blue-600 hover:text-white focus:outline-none"
          >
            Save Change
          </button>
        </div>
      )}
    </>
  );
};

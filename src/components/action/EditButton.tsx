import { HiOutlinePencilSquare } from "react-icons/hi2";

type props = {
  onEdit: () => void;
  isOwner: boolean;
  reset: () => void;
  isEdit: boolean;
};

export const EditButton = ({ onEdit, isOwner, reset, isEdit }: props) => {
  return (
    <>
      <button type="button" onClick={onEdit} className="cursor-pointer">
        {!isEdit && (
          <HiOutlinePencilSquare
            className={`w-7 ${
              isOwner
                ? " rounded-lg p-1 text-gray-800 hover:bg-gray-200"
                : "hidden"
            }`}
          />
        )}
      </button>
      {isEdit && (
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-red-500 px-5 py-1 text-white hover:bg-red-600 hover:text-white"
          >
            Cancel
          </button>
          <button
            form="submit-changes"
            type="submit"
            className="rounded-xl bg-blue-500 px-5 py-1 font-semibold text-white hover:bg-blue-600 hover:text-white"
          >
            Save Change
          </button>
        </div>
      )}
    </>
  );
};

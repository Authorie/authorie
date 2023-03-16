import { users } from "mocks/users";
import type { ChangeEvent } from "react";
import { useState } from "react";
import AuthorResult from "./AuthorResult";

const AddAuthorModal = () => {
  const [authorPenName, setAuthorPenName] = useState("");

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setAuthorPenName(event.target.value);
    console.log(authorPenName);
  };

  return (
    <div className="flex w-fit flex-col items-start justify-center rounded-xl bg-gray-200 p-2 pt-0">
      <div className="max-h-52 overflow-y-scroll border-b-2 border-gray-300 pt-2">
        <div className="h-fit">
          {users.map((user) => (
            <AuthorResult
              key={user.userId}
              penname={user.penname}
              onClickHandler={() => console.log(`add ${user.penname}`)}
            />
          ))}
        </div>
      </div>
      <input
        type="text"
        className="focus:shadow-outline mt-2 w-72 rounded-lg bg-white py-2 px-3 text-xs focus:outline-none"
        placeholder="Enter author's pen name..."
        onChange={onChangeHandler}
      />
    </div>
  );
};

export default AddAuthorModal;

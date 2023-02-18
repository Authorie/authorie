import { useState, ChangeEvent } from "react";

const NewUser = () => {
  const [penName, setPenName] = useState<string>("");
  const [pressed, setPressed] = useState<boolean>(false);

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setPenName(event.target.value);
  };

  const onSubmitHandler = () => {
    setPressed(true);
    if (penName) {
      console.log("passed");
      return;
    } else {
      console.log("no name");
      return;
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex h-screen flex-col items-center justify-center"
    >
      <div className="mb-10 flex items-center gap-4">
        <label className="text-md font-bold text-gray-700">
          Enter your pen name:
        </label>
        <div>
          <input
            className="focus:shadow-outline w-[350px] appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
            id="penName"
            type="text"
            placeholder="your pen name..."
            value={penName}
            onChange={onChangeHandler}
          />
          {pressed && penName === "" && <p>please input you pen name</p>}
        </div>
      </div>
      <button
        type="submit"
        className="rounded-full bg-green-500 py-2 px-8 font-bold text-white hover:bg-green-600"
      >
        Confirm
      </button>
    </form>
  );
};

export default NewUser;

import SearchUserResult from "./SearchUserResult";

type props = {
  onCloseSearchHandler: () => void;
};

const SearchModal = ({ onCloseSearchHandler }: props) => {
  const userInfo = {
    username: "four58",
    userId: 1324532,
    reads: 50,
    followers: 2400,
    following: 25,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
        <div
          className="fixed inset-0 h-full w-full bg-black opacity-40"
          onClick={onCloseSearchHandler}
        />
        <div className="relative flex h-[460px] w-[700px] flex-col rounded-lg border-0 bg-white p-10 shadow-lg outline-none focus:outline-none">
          <div className="mb-5 flex items-start justify-between">
            <h3 className="text-xl font-semibold">Search for users</h3>
            <button
              className="text-xl font-semibold text-black"
              onClick={onCloseSearchHandler}
            >
              X
            </button>
          </div>
          {/*body*/}
          <input
            className="focus:shadow-outline mb-5 w-[350px] appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
            id="searchUser"
            type="text"
            placeholder="Enter UserID"
          />
          <SearchUserResult
            username={userInfo.username}
            userId={userInfo.userId}
            reads={userInfo.reads}
            followers={userInfo.followers}
            following={userInfo.following}
          />
        </div>
      </div>
    </>
  );
};

export default SearchModal;

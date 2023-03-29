export const getServerSideProps = () => {
  return {
    redirect: {
      destination: "/",
    },
  };
};

const MessagesPage = () => {
  <div>Messages Page</div>;
};

export default MessagesPage;

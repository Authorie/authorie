export const getServerSideProps = () => {
  return {
    redirect: {
      destination: "/404",
    },
  };
};

const MessagesPage = () => {
  <div>Messages Page</div>;
};

export default MessagesPage;

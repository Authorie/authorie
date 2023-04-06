export const getServerSideProps = () => {
  return {
    redirect: {
      destination: "/404",
    },
  };
};

const NotificationsPage = () => {
  <div>Messages Page</div>;
};

export default NotificationsPage;

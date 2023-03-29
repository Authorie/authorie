export const getServerSideProps = () => {
  return {
    redirect: {
      destination: "/",
    },
  };
};

const NotificationsPage = () => {
  <div>Messages Page</div>;
};

export default NotificationsPage;

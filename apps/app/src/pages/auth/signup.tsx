export default function SignUp() {}

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: "/auth/signin",
      permanent: false,
    },
  };
};

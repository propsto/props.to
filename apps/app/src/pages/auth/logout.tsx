export default function Login() {}

export async function getServerSideProps() {
  return {
    redirect: {
      permanent: false,
      destination: "/api/auth/signout",
    },
  };
}

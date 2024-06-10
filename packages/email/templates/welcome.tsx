import { Heading, Button, Html } from "@react-email/components";

export const WelcomeEmail = () => {
  return (
    <Html>
      <Heading as="h1" style={{ fontFamily: "sans-serif" }}>
        Hello, Universe!
      </Heading>
      <Button
        href="https://spacejelly.dev"
        style={{
          fontFamily: "sans-serif",
          background: "blueviolet",
          color: "white",
          padding: "12px 20px",
        }}
      >
        Visit Space Jelly
      </Button>
    </Html>
  );
};

export default WelcomeEmail;

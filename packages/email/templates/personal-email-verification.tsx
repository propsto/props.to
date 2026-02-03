import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PersonalEmailVerificationProps {
  code: string;
  userName?: string;
  workEmail?: string;
}

export function PersonalEmailVerification({
  code = "123456",
  userName = "there",
  workEmail = "you@company.com",
}: PersonalEmailVerificationProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://props.to/logo.png"
            width="40"
            height="40"
            alt="props.to"
            style={logo}
          />
          <Heading style={heading}>Verify your personal email</Heading>

          <Text style={paragraph}>Hi {userName},</Text>

          <Text style={paragraph}>
            You&apos;re linking this email as a backup for your props.to account
            ({workEmail}). This ensures you keep access to your feedback even if
            you leave your company.
          </Text>

          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={paragraph}>
            Enter this code in props.to to verify your email. The code expires
            in 15 minutes.
          </Text>

          <Text style={paragraph}>
            If you didn&apos;t request this, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            — The props.to team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  maxWidth: "480px",
};

const logo = {
  margin: "0 auto 24px",
  display: "block",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const codeContainer = {
  background: "#f4f4f5",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const codeText = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "4px",
  margin: "0",
  fontFamily: "monospace",
};

const footer = {
  color: "#a1a1aa",
  fontSize: "14px",
  margin: "32px 0 0",
};

export default PersonalEmailVerification;

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
  Img,
  Row,
  Column,
} from "@react-email/components";

interface PasswordChangedEmailProps {
  userName?: string;
  loginUrl: string;
  changedAt?: Date;
}

export function PasswordChangedEmail({
  userName,
  loginUrl,
  changedAt = new Date(),
}: PasswordChangedEmailProps): React.ReactElement {
  const formattedDate = changedAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>Your props.to password was changed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Row>
              <Column style={styles.logoColumn}>
                <Img
                  src="https://props.to/logo-color-rounded.png"
                  alt="Props.to"
                  width={32}
                  height={32}
                  style={styles.logoImg}
                />
              </Column>
              <Column>
                <Heading as="h1" style={styles.logo}>
                  Props.to
                </Heading>
              </Column>
            </Row>
          </Section>

          <Section style={styles.content}>
            <Heading as="h2" style={styles.heading}>
              Password updated ✓
            </Heading>

            <Text style={styles.text}>Hi{userName ? ` ${userName}` : ""},</Text>

            <Text style={styles.text}>
              Your password was successfully changed on {formattedDate}.
            </Text>

            <Text style={styles.text}>
              You can now sign in with your new password.
            </Text>

            <Button href={loginUrl} style={styles.button}>
              Sign In
            </Button>

            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                <strong>Didn&apos;t make this change?</strong> If you
                didn&apos;t reset your password, please contact support
                immediately and secure your account.
              </Text>
            </Section>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is a security notification. You&apos;re receiving this
              because your account password was changed.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
  },
  header: {
    padding: "32px 48px 0",
  },
  logoColumn: {
    width: "40px",
    verticalAlign: "middle",
  },
  logoImg: {
    borderRadius: "6px",
  },
  logo: {
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0",
    letterSpacing: "0.025em",
    verticalAlign: "middle",
  },
  content: {
    padding: "0 48px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600" as const,
    lineHeight: "1.3",
    margin: "32px 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "16px 0",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },
  warningText: {
    color: "#92400e",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: "6px",
    color: "#fff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600" as const,
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center" as const,
    margin: "24px 0",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "32px 48px",
  },
  footer: {
    padding: "0 48px",
  },
  footerText: {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.5",
  },
};

export default PasswordChangedEmail;

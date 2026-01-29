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
} from "@react-email/components";

interface PasswordResetTokenEmailProps {
  userName?: string;
  resetLink: string;
  expiresInMinutes?: number;
}

export function PasswordResetTokenEmail({
  userName,
  resetLink,
  expiresInMinutes = 60,
}: PasswordResetTokenEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Reset your props.to password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading as="h1" style={styles.logo}>
              props.to
            </Heading>
          </Section>

          <Section style={styles.content}>
            <Heading as="h2" style={styles.heading}>
              Reset your password
            </Heading>

            <Text style={styles.text}>
              Hi{userName ? ` ${userName}` : ""},
            </Text>

            <Text style={styles.text}>
              We received a request to reset your password. Click the button
              below to choose a new one.
            </Text>

            <Button href={resetLink} style={styles.button}>
              Reset Password
            </Button>

            <Text style={styles.expiryNote}>
              This link will expire in {expiresInMinutes} minutes.
            </Text>

            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                If you didn't request this, you can safely ignore this email.
                Your password won't be changed.
              </Text>
            </Section>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              For security, this request was received from your account. If you
              have concerns, please contact support.
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
  logo: {
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0",
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
  expiryNote: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "8px 0 24px",
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
    margin: "24px 0 8px",
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

export default PasswordResetTokenEmail;

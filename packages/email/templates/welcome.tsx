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
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({
  userName,
  dashboardUrl,
}: WelcomeEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Welcome to props.to — your feedback journey starts here</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src="https://props.to/logo-color-rounded.png"
              alt="Props.to"
              width={32}
              height={32}
              style={styles.logoImg}
            />
            <Heading as="h1" style={styles.logo}>
              Props.to
            </Heading>
          </Section>

          <Section style={styles.content}>
            <Heading as="h2" style={styles.heading}>
              Welcome aboard! 🎉
            </Heading>

            <Text style={styles.text}>Hi {userName},</Text>

            <Text style={styles.text}>
              Thanks for joining props.to — the platform that makes giving and
              receiving feedback effortless.
            </Text>

            <Text style={styles.text}>Here's what you can do next:</Text>

            <Section style={styles.listContainer}>
              <Text style={styles.listItem}>
                <strong>1.</strong> Create your first feedback link to share
                with colleagues
              </Text>
              <Text style={styles.listItem}>
                <strong>2.</strong> Customize templates to match your feedback
                style
              </Text>
              <Text style={styles.listItem}>
                <strong>3.</strong> Set goals to track your growth
              </Text>
            </Section>

            <Button href={dashboardUrl} style={styles.button}>
              Go to Dashboard
            </Button>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions? Just reply to this email — we're here to help.
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
    display: "flex",
    alignItems: "center",
  },
  logoImg: {
    marginRight: "8px",
    borderRadius: "6px",
  },
  logo: {
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0",
    letterSpacing: "0.025em",
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
  listContainer: {
    margin: "16px 0",
  },
  listItem: {
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "8px 0",
    paddingLeft: "8px",
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

export default WelcomeEmail;

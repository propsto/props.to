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
  Link,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  expiresInHours?: number;
}

export function MagicLinkEmail({
  url,
  expiresInHours = 24,
}: MagicLinkEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Your sign-in link for props.to</Preview>
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
              Sign in to Props.to
            </Heading>

            <Text style={styles.text}>
              Click the button below to sign in. No password needed.
            </Text>

            <Button href={url} style={styles.button}>
              Sign in
            </Button>

            <Text style={styles.expiryNote}>
              This link works once and expires in {expiresInHours}{" "}
              {expiresInHours === 1 ? "hour" : "hours"}.
            </Text>

            <Text style={styles.fallback}>
              Button not working? Paste this link into your browser:
              <br />
              <Link href={url} style={styles.fallbackLink}>
                {url}
              </Link>
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              If you didn&apos;t try to sign in, you can safely ignore this
              email. Nobody can sign in without this link.
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
  header: { padding: "32px 48px 0" },
  logoColumn: { width: "40px", verticalAlign: "middle" },
  logoImg: { borderRadius: "6px" },
  logo: {
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0",
    letterSpacing: "0.025em",
    verticalAlign: "middle",
  },
  content: { padding: "0 48px" },
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
  expiryNote: { color: "#6b7280", fontSize: "14px", margin: "8px 0 24px" },
  fallback: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 16px",
  },
  fallbackLink: { color: "#6b7280", wordBreak: "break-all" as const },
  hr: { borderColor: "#e5e7eb", margin: "32px 48px" },
  footer: { padding: "0 48px" },
  footerText: { color: "#6b7280", fontSize: "12px", lineHeight: "1.5" },
};

export default MagicLinkEmail;

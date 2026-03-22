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

interface OrgInviteEmailProps {
  inviterName?: string;
  orgName?: string;
  role?: string;
  inviteLink?: string;
  message?: string;
  expiresInHours?: number;
}

export function OrgInviteEmail({
  inviterName,
  orgName = "your organization",
  role = "MEMBER",
  inviteLink = "#",
  message,
  expiresInHours = 24,
}: OrgInviteEmailProps): React.ReactElement {
  const roleLower = role.toLowerCase() === "admin" ? "an admin" : "a member";

  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been invited to join {orgName} on Props.to
      </Preview>
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
              You&apos;ve been invited to join {orgName}
            </Heading>

            <Text style={styles.text}>
              {inviterName
                ? `${inviterName} has invited you`
                : "You've been invited"}{" "}
              to join <strong>{orgName}</strong> on Props.to as {roleLower}.
            </Text>

            {message ? (
              <Section style={styles.messageBox}>
                <Text style={styles.messageLabel}>Personal message:</Text>
                <Text style={styles.messageText}>&ldquo;{message}&rdquo;</Text>
              </Section>
            ) : null}

            <Button href={inviteLink} style={styles.button}>
              Accept Invitation
            </Button>

            <Text style={styles.expiryNote}>
              This invitation expires in {expiresInHours} hours.
            </Text>

            <Section style={styles.infoBox}>
              <Text style={styles.infoText}>
                Props.to is a personal feedback platform. Once you join{" "}
                {orgName}, you&apos;ll be able to send and receive feedback with
                your teammates.
              </Text>
            </Section>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              If you weren&apos;t expecting this invitation, you can safely
              ignore this email.
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
  messageBox: {
    backgroundColor: "#f9fafb",
    borderLeft: "4px solid #e5e7eb",
    borderRadius: "4px",
    padding: "12px 16px",
    margin: "16px 0",
  },
  messageLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 4px",
  },
  messageText: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.5",
    margin: "0",
    fontStyle: "italic" as const,
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
  expiryNote: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "8px 0 24px",
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },
  infoText: {
    color: "#1e40af",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
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

export default OrgInviteEmail;

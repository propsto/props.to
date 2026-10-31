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

interface ConversationEscalationEmailProps {
  recipientName: string;
  orgName: string;
  memberName: string;
  ownerName: string;
  stageLabel: string;
  url: string;
}

// To org owners and admins when a conversation reaches the second step or
// beyond: "there's a recurring problem, it's being worked on, here's who".
export function ConversationEscalationEmail({
  recipientName = "there",
  orgName = "your organization",
  memberName = "a member",
  ownerName = "their lead",
  stageLabel = "Repeated without change",
  url = "https://app.props.to",
}: ConversationEscalationEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>
        Recurring problem with {memberName} at {orgName}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.content}>
            <Heading as="h2" style={styles.heading}>
              Recurring problem with {memberName}
            </Heading>
            <Text style={styles.text}>Hi {recipientName},</Text>
            <Text style={styles.text}>
              There is a recurring problem with <strong>{memberName}</strong> at{" "}
              {orgName}. <strong>{ownerName}</strong> is working on it and
              recorded the step <strong>{stageLabel}</strong>.
            </Text>
            <Text style={styles.text}>
              This is to keep it on your radar. The conversation has the
              expected change, the review date and what happens if there is no
              change.
            </Text>
            <Button href={url} style={styles.button}>
              View conversation
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.content}>
            <Text style={styles.footerText}>
              You received this email because you are an owner or admin of{" "}
              {orgName} on Props.to.
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
    maxWidth: "600px",
  },
  content: { padding: "0 48px" },
  heading: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "600" as const,
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
    margin: "24px 0",
  },
  hr: { borderColor: "#e5e7eb", margin: "32px 48px" },
  footerText: { color: "#9ca3af", fontSize: "12px", lineHeight: "1.5" },
};

export default ConversationEscalationEmail;

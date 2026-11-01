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

interface ConversationStepEmailProps {
  recipientName: string;
  orgName: string;
  stageLabel: string;
  reviewDate?: string;
  hasConsequence: boolean;
  url: string;
}

// To the member a conversation is about. Carries no note text: what was said
// is read inside the app, not in company mail.
export function ConversationStepEmail({
  recipientName = "there",
  orgName = "your organization",
  stageLabel = "Direct feedback",
  reviewDate,
  hasConsequence = false,
  url = "https://app.props.to/conversations",
}: ConversationStepEmailProps): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>A conversation about your work at {orgName} was updated</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.content}>
            <Heading as="h2" style={styles.heading}>
              A conversation was updated
            </Heading>
            <Text style={styles.text}>Hi {recipientName},</Text>
            <Text style={styles.text}>
              A step was added to a conversation about your work at{" "}
              <strong>{orgName}</strong>: <strong>{stageLabel}</strong>.
            </Text>
            {reviewDate ? (
              <Text style={styles.text}>
                Review date: <strong>{reviewDate}</strong>.
              </Text>
            ) : null}
            {hasConsequence ? (
              <Text style={styles.text}>
                It states what happens if nothing changes.
              </Text>
            ) : null}
            <Text style={styles.text}>
              Open it to read the expected change and what was agreed.
            </Text>
            <Button href={url} style={styles.button}>
              Open conversation
            </Button>
          </Section>
          <Hr style={styles.hr} />
          <Section style={styles.content}>
            <Text style={styles.footerText}>
              You received this email because a lead or admin at {orgName}{" "}
              recorded a conversation step about you on Props.to.
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

export default ConversationStepEmail;

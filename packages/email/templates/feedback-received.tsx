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

interface FeedbackReceivedEmailProps {
  recipientName: string;
  feedbackPreview?: string;
  senderName?: string;
  isAnonymous: boolean;
  feedbackType: string;
  dashboardUrl: string;
}

export function FeedbackReceivedEmail({
  recipientName = "there",
  feedbackPreview,
  senderName,
  isAnonymous = false,
  feedbackType = "recognition",
  dashboardUrl = "https://app.props.to",
}: FeedbackReceivedEmailProps): React.ReactElement {
  const previewText = isAnonymous
    ? `You received anonymous ${feedbackType.toLowerCase()} feedback`
    : `${senderName ?? "Someone"} sent you ${feedbackType.toLowerCase()} feedback`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
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
              You received new feedback! 🎉
            </Heading>

            <Text style={styles.text}>Hi {recipientName},</Text>

            <Text style={styles.text}>
              {isAnonymous ? (
                <>Someone sent you anonymous {feedbackType.toLowerCase()} feedback.</>
              ) : (
                <>
                  <strong>{senderName ?? "Someone"}</strong> sent you{" "}
                  {feedbackType.toLowerCase()} feedback.
                </>
              )}
            </Text>

            {feedbackPreview && !isAnonymous && (
              <Section style={styles.previewBox}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Text style={styles.previewText}>
                  &quot;{feedbackPreview.slice(0, 200)}
                  {feedbackPreview.length > 200 ? "..." : ""}&quot;
                </Text>
              </Section>
            )}

            {isAnonymous && (
              <Text style={styles.anonymousNote}>
                This feedback was submitted anonymously. View the full feedback
                in your dashboard.
              </Text>
            )}

            <Button href={dashboardUrl} style={styles.button}>
              View Feedback
            </Button>
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this email because someone submitted feedback through
              your props.to profile. You can manage your notification
              preferences in your account settings.
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
  previewBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
  },
  previewLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    margin: "0 0 8px",
  },
  previewText: {
    color: "#1f2937",
    fontSize: "15px",
    fontStyle: "italic" as const,
    lineHeight: "1.5",
    margin: "0",
  },
  anonymousNote: {
    color: "#6b7280",
    fontSize: "14px",
    fontStyle: "italic" as const,
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

export default FeedbackReceivedEmail;

import type { Metadata } from "next";
import { LegalPage } from "@components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy · props.to",
  description: "How props.to collects, uses and protects your information.",
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <LegalPage title="Privacy policy" updated="November 1, 2026">
      <p>
        This policy explains how Props.to (&quot;we&quot;) handles information
        when you use props.to, app.props.to and auth.props.to (the
        &quot;Service&quot;). In short: we collect what&apos;s needed to sign
        you in and deliver feedback. We don&apos;t sell your data, show ads, or
        use your feedback to train AI models.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address, profile
          picture and, if you sign up with email, a hashed password.
        </li>
        <li>
          <strong>Organization details:</strong> the company you belong to, your
          groups, role and level, and who leads which group, as set by your
          organization&apos;s admins.
        </li>
        <li>
          <strong>Feedback and conversations:</strong> feedback you give or
          receive, the values it is tagged with, and conversation notes.
        </li>
        <li>
          <strong>Anonymous feedback:</strong> when you send feedback
          anonymously, your identity is hidden from the recipient.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type and request
          logs, used for security, rate limiting and fixing errors.
        </li>
        <li>
          <strong>Cookies:</strong> only those needed to keep you signed in
          across props.to. We don&apos;t use advertising cookies.
        </li>
      </ul>

      <h2>Google user data</h2>
      <p>If you sign in with Google, we request these permissions:</p>
      <ul>
        <li>
          <strong>openid, email and profile:</strong> your Google account ID,
          name, email address, profile picture and Workspace domain. We use them
          to create your account, sign you in and connect you to your company.
        </li>
        <li>
          <strong>admin.directory.user.readonly:</strong> your own user record
          in your company&apos;s Google Workspace directory. We read it only to
          check whether you are a Workspace admin, so only admins can set up
          your company on props.to. We store only that yes or no, and we
          don&apos;t read anyone else&apos;s record.
        </li>
      </ul>
      <p>
        We don&apos;t access your email, files or calendar. props.to&apos;s use
        and transfer of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We don&apos;t use Google user
        data for advertising, don&apos;t sell it, don&apos;t use it to train AI
        or machine learning models, and no person reads it except with your
        consent, for security, or to comply with the law.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>
          To run the Service: sign-in, delivering feedback, moderation,
          conversations and notifications.
        </li>
        <li>
          To send the emails the Service needs, such as sign-in links and new
          feedback notices.
        </li>
        <li>To keep the Service secure, prevent abuse and fix errors.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Inside your organization, feedback is visible to the person it is about.
        Admins see feedback waiting for moderation. Conversations about a
        member, including internal notes, are visible to the organization&apos;s
        owners and admins and to the leads of that member&apos;s groups. The
        member can read the shared parts of those conversations, but not the
        internal notes.
      </p>
      <p>
        These providers process data on our behalf: Vercel (hosting), Neon
        (database), Resend (email) and Google (sign-in). We may disclose
        information if the law requires it, or to protect people or the Service.
      </p>

      <h2>Storage and retention</h2>
      <p>
        Data is stored in the United States (AWS us-east-2, Ohio) and encrypted
        in transit. We keep your account and feedback while your account is
        active. When you leave an organization, your personal feedback stays in
        your account and the organization keeps the feedback shared with it.
        When you delete your account, we delete your personal data within 30
        days, except where the law requires us to keep it.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          Access, correct, export or delete your data by emailing{" "}
          <a href="mailto:hello@props.to">hello@props.to</a>.
        </li>
        <li>
          Remove props.to&apos;s access to your Google account at any time in
          your{" "}
          <a href="https://myaccount.google.com/permissions">
            Google account permissions
          </a>
          .
        </li>
        <li>
          Depending on where you live, you may have more rights under laws like
          the GDPR. We answer requests within 30 days.
        </li>
      </ul>
      <p>The Service is not meant for children under 16.</p>
      <p>
        We post changes to this policy here and email you before significant
        changes take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Email us at <a href="mailto:hello@props.to">hello@props.to</a>.
      </p>
    </LegalPage>
  );
}

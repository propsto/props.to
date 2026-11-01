import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@components/legal-page";

export const metadata: Metadata = {
  title: "Terms of service · props.to",
  description: "The terms for using props.to.",
};

export default function TermsPage(): React.ReactElement {
  return (
    <LegalPage title="Terms of service" updated="November 1, 2026">
      <p>
        These terms are an agreement between you and Props.to (&quot;we&quot;)
        for using props.to, app.props.to and auth.props.to (the
        &quot;Service&quot;). By using the Service you agree to them and to our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Accounts</h2>
      <p>
        You must be at least 16 to use the Service. Keep your sign-in secure and
        tell us at hello@props.to if you think someone else used your account.
        You&apos;re responsible for what happens under your account.
      </p>

      <h2>Organizations</h2>
      <p>
        If you set up props.to for a company, you confirm you&apos;re allowed to
        act for it. Its admins control members, groups, leads, values, levels
        and moderation, and can see feedback waiting for moderation. A separate
        agreement with a company wins where it conflicts with these terms.
      </p>

      <h2>Your content</h2>
      <p>
        You own the feedback and notes you write. You let us store, process and
        show them only as needed to run the Service. Feedback about you stays in
        your account when you leave a company, and the company keeps the
        feedback that was shared with it.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Feedback should be honest and about work. Don&apos;t use the Service to:
      </p>
      <ul>
        <li>
          harass, threaten or discriminate against anyone, including through
          anonymous feedback;
        </li>
        <li>share other people&apos;s private or confidential information;</li>
        <li>impersonate someone or misrepresent who you are;</li>
        <li>send spam or malware, or disrupt the Service;</li>
        <li>break the law.</li>
      </ul>
      <p>
        Organization admins and we may remove content that breaks these rules,
        and we may suspend accounts that keep doing so.
      </p>

      <h2>Open source</h2>
      <p>
        The props.to code is available under the{" "}
        <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU AGPL-3.0</a>.
        These terms cover the hosted Service we run, not copies you run
        yourself.
      </p>

      <h2>Warranty and liability</h2>
      <p>
        The Service is in early access and provided &quot;as is&quot;, without
        warranties of any kind. To the extent the law allows, we aren&apos;t
        liable for indirect or consequential losses, and our total liability is
        limited to what you paid us in the last 12 months.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can stop using the Service and ask us to delete your account at any
        time. We may suspend or end access if you break these terms. We post
        changes to these terms here and email you before significant changes
        take effect. These terms are governed by the laws of Uruguay.
      </p>

      <h2>Contact</h2>
      <p>
        Email us at <a href="mailto:hello@props.to">hello@props.to</a>.
      </p>
    </LegalPage>
  );
}

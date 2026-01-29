import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Templates | props.to",
  description: "Preview email templates used by props.to",
};

const templates = [
  {
    name: "Welcome",
    file: "welcome.html",
    description: "Sent when a new user signs up",
  },
  {
    name: "Password Reset",
    file: "password-reset-token.html",
    description: "Sent when a user requests a password reset",
  },
  {
    name: "Password Changed",
    file: "password-changed.html",
    description: "Confirmation when password is successfully changed",
  },
];

export default function EmailTemplatesPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Email Templates
        </h1>
        <p className="mb-8 text-gray-600">
          Preview the email templates used by props.to
        </p>

        <div className="space-y-4">
          {templates.map((template) => (
            <a
              key={template.file}
              href={`/email-templates/${template.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {template.description}
                  </p>
                </div>
                <span className="text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-gray-400">
                /email-templates/{template.file}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> These templates are automatically exported
            from the <code className="rounded bg-gray-200 px-1">@propsto/email</code> package
            during build.
          </p>
        </div>
      </div>
    </div>
  );
}

import { constServer } from "@propsto/constants/server";
import { constClient } from "@propsto/constants/client";
import { vercelPreviewEnvVars } from "@propsto/constants/other";
import { CopyButton } from "./copy-button";

export default function DebugPage() {
  // Mask sensitive parts of DATABASE_URL
  const dbUrl = process.env.DATABASE_URL ?? "";
  const maskedDbUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

  const rawEnvVars = {
    // Raw process.env values
    VERCEL_ENV: process.env.VERCEL_ENV ?? "(not set)",
    VERCEL_GIT_PULL_REQUEST_ID:
      process.env.VERCEL_GIT_PULL_REQUEST_ID ?? "(not set)",
    VERCEL_URL: process.env.VERCEL_URL ?? "(not set)",
    PROPSTO_HOST: process.env.PROPSTO_HOST ?? "(not set)",
    AUTH_PROXY_HOST: process.env.AUTH_PROXY_HOST ?? "(not set)",
    AUTH_URL: process.env.AUTH_URL ?? "(not set)",
    "process.env.AUTH_REDIRECT_PROXY_URL":
      process.env.AUTH_REDIRECT_PROXY_URL ?? "(not set)",
    DATABASE_URL: maskedDbUrl || "(not set)",
  };

  const computedEnvVars = {
    // vercelPreviewEnvVars (computed)
    "vercelPreviewEnvVars.AUTH_URL":
      vercelPreviewEnvVars.AUTH_URL ?? "(not set)",
    "vercelPreviewEnvVars.AUTH_REDIRECT_PROXY_URL":
      vercelPreviewEnvVars.AUTH_REDIRECT_PROXY_URL ?? "(not set)",
    "vercelPreviewEnvVars.PROPSTO_APP_URL":
      vercelPreviewEnvVars.PROPSTO_APP_URL ?? "(not set)",
  };

  const serverConst = {
    // constServer (validated)
    "constServer.PROPSTO_ENV": constServer.PROPSTO_ENV,
    "constServer.PROPSTO_HOST": constServer.PROPSTO_HOST,
    "constServer.PROPSTO_APP_URL": constServer.PROPSTO_APP_URL,
    "constServer.AUTH_URL": constServer.AUTH_URL,
    "constServer.AUTH_REDIRECT_PROXY_URL":
      constServer.AUTH_REDIRECT_PROXY_URL ?? "(not set)",
  };

  const clientConst = {
    // constClient (validated)
    "constClient.NEXT_PUBLIC_AUTH_URL": constClient.NEXT_PUBLIC_AUTH_URL,
    "constClient.NEXT_PUBLIC_PROPSTO_APP_URL":
      constClient.NEXT_PUBLIC_PROPSTO_APP_URL,
  };

  const analysis = {
    isPreview: process.env.VERCEL_ENV === "preview",
    shouldUseProxy:
      process.env.VERCEL_ENV === "preview" &&
      Boolean(process.env.AUTH_PROXY_HOST),
    proxyUrlSetOnProcessEnv: Boolean(process.env.AUTH_REDIRECT_PROXY_URL),
    expectedProxyUrl: process.env.AUTH_PROXY_HOST
      ? `https://auth.${process.env.AUTH_PROXY_HOST}/api/auth`
      : null,
  };

  const allDebugData = {
    timestamp: new Date().toISOString(),
    rawEnvVars,
    computedEnvVars,
    serverConst,
    clientConst,
    analysis,
  };

  const EnvTable = ({
    title,
    vars,
  }: {
    title: string;
    vars: Record<string, string>;
  }) => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4">Variable</th>
            <th className="text-left py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(vars).map(([key, value]) => (
            <tr
              key={key}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="py-2 pr-4 font-mono text-xs">{key}</td>
              <td className="py-2 font-mono text-xs break-all">
                {value === "(not set)" ? (
                  <span className="text-gray-400">{value}</span>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Auth Debug Info</h1>
        <CopyButton data={allDebugData} />
      </div>

      <EnvTable title="Raw process.env" vars={rawEnvVars} />
      <EnvTable
        title="vercelPreviewEnvVars (computed)"
        vars={computedEnvVars}
      />
      <EnvTable title="constServer (validated)" vars={serverConst} />
      <EnvTable title="constClient (validated)" vars={clientConst} />

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">OAuth Proxy Analysis</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Is Preview:</strong> {analysis.isPreview ? "Yes" : "No"}
          </li>
          <li>
            <strong>Should use proxy:</strong>{" "}
            {analysis.shouldUseProxy ? "Yes" : "No"}
          </li>
          <li>
            <strong>Proxy URL set on process.env:</strong>{" "}
            {analysis.proxyUrlSetOnProcessEnv ? "Yes" : "No"}
          </li>
          <li>
            <strong>Expected proxy URL:</strong>{" "}
            {analysis.expectedProxyUrl ?? "(AUTH_PROXY_HOST not set)"}
          </li>
        </ul>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Generated at: {new Date().toISOString()}
      </p>
    </div>
  );
}

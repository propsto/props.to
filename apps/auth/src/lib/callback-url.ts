// Where a signed-in user may be sent after auth: a relative path, this origin,
// or PROPSTO_HOST and any of its subdomains (app, auth, preview deploys).
// Shared by the Auth.js redirect callback and the onboarding flow.
export function isAllowedRedirect(
  url: string,
  baseUrl: string,
  host: string | undefined,
): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const { origin, hostname } = new URL(url);
    if (origin === baseUrl) return true;
    return (
      Boolean(host) && (hostname === host || hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
}

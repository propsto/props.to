// Who belongs to a Google Workspace org by email domain. Pure (no db) so the
// invite guard (app) and the domain-join guard (auth) share one definition of
// "is this a company address" and "may this person auto-join".

/** True when the email sits on the org's verified Workspace domain. */
export function emailMatchesDomain(
  email: string,
  hostedDomain: string | null | undefined,
): boolean {
  const domain = hostedDomain?.trim().toLowerCase() ?? "";
  if (!domain) return false;
  // endsWith on "@domain" rejects look-alikes ("…@notdomain.com") and
  // subdomains ("…@sub.domain.com"), which a bare substring check would not.
  return email.trim().toLowerCase().endsWith(`@${domain}`);
}

/**
 * Whether a Workspace user may auto-join their domain's org without an invite.
 * Workspace admins always may — they are the domain's authority and this is how
 * co-admins get in — everyone else only when the org opted into domain join.
 */
export function mayAutoJoinByDomain(opts: {
  autoJoinByDomain: boolean;
  isGoogleWorkspaceAdmin: boolean;
}): boolean {
  return opts.isGoogleWorkspaceAdmin || opts.autoJoinByDomain;
}

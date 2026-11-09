// Pure rule for the top-level slugs picked during onboarding (personal
// username, organization slug). Kept out of the server action so it can be
// unit tested. Messages match the app's org slug settings.

import { isReservedSlug } from "@propsto/constants/other";
import { isValidSlugFormat } from "@propsto/data/repos";

export function slugRejection(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (!isValidSlugFormat(normalized)) {
    return "Use 3 to 30 lowercase letters, numbers, and single hyphens, not starting or ending with a hyphen";
  }
  if (isReservedSlug(normalized)) return "This URL is reserved";
  return null;
}

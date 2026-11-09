import { isValidSlugFormat } from "@propsto/data/repos";

export const MAX_LINK_NAME = 100;

// The public route serves "<owner>/thanks" as the confirmation page
const RESERVED_LINK_SLUGS = new Set(["thanks"]);

type LinkInput = { name?: string; slug?: string };
type CleanLinkInput =
  | { success: true; name?: string; slug?: string }
  | { success: false; error: string };

// One rule for every link create path: the name is trimmed and capped, the
// slug is trimmed, lowercased, format-checked and must not be reserved.
// An absent or empty slug stays undefined so the repo generates one.
export function cleanLinkInput(input: LinkInput): CleanLinkInput {
  let name: string | undefined;
  if (input.name !== undefined) {
    name = input.name.trim();
    if (!name) return { success: false, error: "Name is required" };
    if (name.length > MAX_LINK_NAME) {
      return {
        success: false,
        error: `Name must be ${MAX_LINK_NAME} characters or fewer`,
      };
    }
  }

  const slug = input.slug?.trim().toLowerCase() || undefined;
  if (slug && !isValidSlugFormat(slug)) {
    return {
      success: false,
      error: "Slug must be 3-30 lowercase letters, numbers or dashes",
    };
  }
  if (slug && RESERVED_LINK_SLUGS.has(slug)) {
    return { success: false, error: "That slug is reserved" };
  }

  return { success: true, name, slug };
}

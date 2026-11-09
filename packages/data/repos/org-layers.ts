import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Which feedback layers an organization uses. Values and levels exist while
// the org has active (unarchived) rows; conversations follow the org setting.
export type OrgLayers = {
  values: boolean;
  levels: boolean;
  conversations: boolean;
};

/**
 * The single answer to "does this org use values, levels, conversations?".
 * Member-facing surfaces gate on it; admin pages stay reachable so an admin
 * can create the first row.
 */
export async function getOrgLayers(organizationId: string) {
  try {
    logger("getOrgLayers", { organizationId });

    const [value, level, settings] = await Promise.all([
      db.orgValue.findFirst({
        where: { organizationId, archivedAt: null },
        select: { id: true },
      }),
      db.orgLevel.findFirst({
        where: { organizationId, archivedAt: null },
        select: { id: true },
      }),
      db.organizationSettings.findUnique({
        where: { organizationId },
        select: { enableConversations: true },
      }),
    ]);

    const layers: OrgLayers = {
      values: value !== null,
      levels: level !== null,
      // No settings row means the defaults, and conversations default to on
      conversations: settings?.enableConversations ?? true,
    };
    return handleSuccess(layers);
  } catch (e) {
    return handleError(e);
  }
}

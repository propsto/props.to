import { cache } from "react";
import {
  getOrgLayers as fetchOrgLayers,
  type OrgLayers,
} from "@propsto/data/repos";

export type { OrgLayers };

/**
 * Which layers an org uses, computed once per request. A failed lookup shows
 * no optional layer rather than one the org may have turned off.
 */
export const getOrgLayers = cache(
  async (organizationId: string): Promise<OrgLayers> => {
    const result = await fetchOrgLayers(organizationId);
    return result.success
      ? result.data
      : { values: false, levels: false, conversations: false };
  },
);

import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { AdapterAccount } from "@auth/core/adapters";
import { handleError } from "../utils/errorHandling";

export async function getAccount(providerAccountId, provider) {
  try {
    logger("getAccount", { providerAccountId, provider });
    const account = db.account.findFirst({
      where: { providerAccountId, provider },
    }) as Promise<AdapterAccount | null>;
    return { success: true, data: account, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function linkAccount(data: AdapterAccount) {
  try {
    logger("linkAccount", { data });
    const linkedAccount = await db.account.create({ data });
    return { success: true, data: linkedAccount, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function unlinkAccount(providerAccountId: {
  provider: string;
  providerAccountId: string;
}) {
  try {
    logger("unlinkAccount", { providerAccountId });
    const unlinkedAccount = await db.account.delete({
      where: { provider_providerAccountId: providerAccountId },
    });
    return { success: true, data: unlinkedAccount, error: null };
  } catch (e) {
    return handleError(e);
  }
}

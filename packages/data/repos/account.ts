import { logger } from "@propsto/logger?data";
import { db } from "../db";
import { AdapterAccount } from "@auth/core/adapters";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

export async function getAccount(providerAccountId: string, provider: string) {
  try {
    logger("getAccount", { providerAccountId, provider });
    const account = db.account.findFirst({
      where: { providerAccountId, provider },
    }) as Promise<AdapterAccount | null>;
    return handleSuccess(account);
  } catch (e) {
    return handleError(e);
  }
}

export async function linkAccount(data: AdapterAccount) {
  try {
    logger("linkAccount", { data });
    const linkedAccount = await db.account.create({ data });
    return handleSuccess(linkAccount);
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
    return handleSuccess(unlinkedAccount);
  } catch (e) {
    return handleError(e);
  }
}

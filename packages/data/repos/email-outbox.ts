import { createLogger } from "@propsto/logger";
import { db } from "../db";
import { handleError } from "../utils/error-handling";
import { handleSuccess } from "../utils/success-handling";

const logger = createLogger("data");

// Outbound email captured instead of sent (EMAIL_PROVIDER=outbox: previews and tests only)
export async function createOutboxEmail(data: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    logger("createOutboxEmail", { to: data.to, subject: data.subject });
    const email = await db.emailOutbox.create({
      data: { ...data, to: data.to.toLowerCase() },
    });
    return handleSuccess(email);
  } catch (e) {
    return handleError(e);
  }
}

export async function listOutboxEmails(to: string, take = 20) {
  try {
    logger("listOutboxEmails", { to });
    const emails = await db.emailOutbox.findMany({
      where: { to: to.toLowerCase() },
      orderBy: { createdAt: "desc" },
      take,
    });
    return handleSuccess(emails);
  } catch (e) {
    return handleError(e);
  }
}

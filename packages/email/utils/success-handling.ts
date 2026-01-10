import { createLogger } from "@propsto/logger";

const logger = createLogger("email");

export function handleSuccess<T>(data: T): HandleSuccessEvent<T> {
  logger("handleSuccess", { data });
  return { success: true, data, error: undefined };
}

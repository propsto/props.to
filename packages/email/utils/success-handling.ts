import { logger } from "@propsto/logger?email";

export function handleSuccess<T>(data: T): HandleSuccessEvent<T> {
  logger("handleSuccess", { data });
  return { success: true, data, error: undefined };
}

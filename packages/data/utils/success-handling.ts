import { logger } from "@propsto/logger?data";

export function handleSuccess<T>(data: T): HandleSuccessEvent<T> {
  logger("handleSuccess", { data });
  return { success: true, data };
}

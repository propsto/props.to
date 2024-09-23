import { type DbSuccess } from "../db";
import { logger } from "@propsto/logger?data";

export function handleSuccess<T>(data: T): DbSuccess<T> {
  logger("repos/handleSuccess", { data });
  return { success: true, data, error: null };
}

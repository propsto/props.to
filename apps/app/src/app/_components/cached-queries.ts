import { cache } from "react";
import { getFeedbackStats as _getFeedbackStats } from "@propsto/data/repos";

/**
 * Cached version of getFeedbackStats.
 * Deduplicates calls within the same request (e.g., across Suspense boundaries).
 */
export const getFeedbackStats = cache(_getFeedbackStats);

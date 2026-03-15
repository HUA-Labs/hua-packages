/**
 * QuotaStore interface
 *
 * Single quota system for submissions
 * - 1 submission = 1 diary entry + 1 analysis
 * - No separate diary/analysis quota
 */

export interface QuotaData {
  count: number;
  limit: number;
  reset_at: Date;
}

export interface QuotaStore {
  /**
   * Get user quota info
   * @param userId User ID
   * @param period Daily or monthly
   */
  get(userId: string, period: "daily" | "monthly"): Promise<QuotaData>;

  /**
   * Increment user quota
   * @param userId User ID
   * @param period Daily or monthly
   */
  increment(userId: string, period: "daily" | "monthly"): Promise<void>;

  /**
   * Reset user quota (when reset time has passed)
   * @param userId User ID
   * @param period Daily or monthly
   */
  reset(userId: string, period: "daily" | "monthly"): Promise<void>;
}

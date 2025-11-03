/**
 * Centralized Urgency Calculator
 * 
 * Single source of truth for urgency calculation across all services.
 * Used by:
 * - Statistics service (for historical urgency at completion time)
 * - Task analytics service (for real-time urgency)
 * - Any other service that needs to calculate task urgency
 * 
 * NEW ALGORITHM (Simplified):
 * - Urgency is calculated based on proximity to limit date
 * - Closer limit date = HIGHER urgency number
 * - Target date is used for tie-breaking when limit dates are equal
 * - The urgency number is primarily for sorting (higher = more urgent)
 */

import type { UrgencyCalculationInput, UrgencyCalculationResult } from "../services/types";

export class UrgencyCalculator {
  /**
   * Calculate urgency for a task occurrence
   *
   * Algorithm:
   * - Uses limit date as primary urgency factor
   * - Urgency = 1000 - daysUntilLimit (so closer dates have higher urgency)
   * - If limit dates are equal, uses target date for tie-breaking
   * - Overdue tasks get extra urgency boost
   *
   * @param input - The urgency calculation parameters
   * @returns The calculated urgency and metadata
   */
  static calculateUrgency(input: UrgencyCalculationInput): UrgencyCalculationResult {
    const { currentDate, creationDate, targetDate, limitDate } = input;

    // If no dates are set, urgency is minimal
    if (!targetDate && !limitDate) {
      return {
        urgency: 0,
        isOverdue: false,
      };
    }

    const now = currentDate.getTime();
    const target = targetDate?.getTime();
    const limit = limitDate?.getTime();

    // Calculate days until dates
    const daysUntilTarget = target
      ? Math.floor((target - now) / (1000 * 60 * 60 * 24))
      : undefined;
    const daysUntilLimit = limit
      ? Math.floor((limit - now) / (1000 * 60 * 60 * 24))
      : undefined;

    let urgency = 0;
    let isOverdue = false;

    // Primary calculation: based on limit date
    if (limit) {
      const daysUntilLimitValue = Math.floor((limit - now) / (1000 * 60 * 60 * 24));
      
      // Overdue tasks get very high urgency
      if (daysUntilLimitValue < 0) {
        // More days overdue = higher urgency
        // Base urgency of 1000 + days overdue
        urgency = 1000 + Math.abs(daysUntilLimitValue);
        isOverdue = true;
      } else {
        // Not overdue: urgency = 1000 - days until limit
        // So 0 days away = 1000, 1 day away = 999, etc.
        urgency = 1000 - daysUntilLimitValue;
      }
      
      // Use target date for fine-grained tie-breaking (fractional component)
      // If two tasks have same limit date, the one with closer target is more urgent
      if (target) {
        const daysUntilTargetValue = Math.floor((target - now) / (1000 * 60 * 60 * 24));
        // Add a small fractional component based on target date (max 0.999)
        const targetComponent = Math.min(0.999, (1000 - daysUntilTargetValue) / 1000);
        urgency += targetComponent;
      }
    }
    // Fallback: only target date exists
    else if (target) {
      const daysUntilTargetValue = Math.floor((target - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilTargetValue < 0) {
        urgency = 500 + Math.abs(daysUntilTargetValue);
        isOverdue = true;
      } else {
        // Lower urgency range for tasks without limit date
        urgency = 500 - daysUntilTargetValue;
      }
    }

    return {
      urgency: Math.round(urgency * 100) / 100, // Round to 2 decimals
      isOverdue,
      daysUntilTarget,
      daysUntilLimit,
    };
  }
}

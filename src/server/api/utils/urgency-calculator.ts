/**
 * Centralized Urgency Calculator
 * 
 * Single source of truth for urgency calculation across all services.
 * Used by:
 * - Statistics service (for historical urgency at completion time)
 * - Task analytics service (for real-time urgency)
 * - Any other service that needs to calculate task urgency
 */

import type { UrgencyCalculationInput, UrgencyCalculationResult } from "../services/types";

export class UrgencyCalculator {
  /**
   * Calculate urgency for a task occurrence
   *
   * Algorithm:
   * - Urgency 0-5: Before target date (based on progress: time elapsed / time remaining)
   * - Urgency 5-10: Between target and limit date
   * - Urgency > 10: Past limit date (overdue)
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
    const created = creationDate.getTime();
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

    // Case 1: Past limit date - OVERDUE
    if (limit && now > limit) {
      const daysOverdue = Math.abs(daysUntilLimit ?? 0);
      urgency = 10 + Math.min(daysOverdue * 0.5, 10); // Max urgency of 20
      isOverdue = true;
    }
    // Case 2: Between target and limit
    else if (target && limit && now >= target && now <= limit) {
      const totalRange = limit - target;
      const elapsed = now - target;
      const progress = totalRange > 0 ? elapsed / totalRange : 1;
      urgency = 5 + progress * 5; // Range 5-10
    }
    // Case 3: Before target date
    else if (target && now < target) {
      const timeElapsed = now - created;
      const timeRemaining = target - now;

      // Avoid division by zero
      if (timeRemaining <= 0) {
        urgency = 5;
      } else if (timeElapsed <= 0) {
        // If we just created the task, minimal urgency but not zero
        const totalTime = target - created;
        urgency = totalTime > 0 ? 0.5 : 1; // Min 0.5, max 1
      } else {
        // urgency = 5 * (timeElapsed / timeRemaining)
        // As we approach target, timeRemaining decreases and urgency increases
        urgency = Math.min(5, 5 * (timeElapsed / timeRemaining));
      }
    }
    // Case 4: Only limit date exists and we're before it
    else if (limit && now < limit) {
      const timeElapsed = now - created;
      const timeRemaining = limit - now;

      // Avoid division by zero
      if (timeRemaining <= 0) {
        urgency = 10;
      } else if (timeElapsed <= 0) {
        // If we just created the task, minimal urgency but not zero
        const totalTime = limit - created;
        urgency = totalTime > 0 ? 0.5 : 1; // Min 0.5, max 1
      } else {
        // Similar to case 3, but scaled to 10 instead of 5
        urgency = Math.min(10, 10 * (timeElapsed / timeRemaining));
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

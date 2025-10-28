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
   * Special case: If target and limit are very close (distance target->limit < half of start->target),
   * use proportional calculation from start to limit for more accurate urgency.
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

    // Check if we should use alternative calculation method
    // When target and limit dates are very close, use proportional calculation
    const useAlternativeCalculation = target && limit && 
      (limit - target) < (target - created) / 2;

    // Case 1: Past limit date - OVERDUE
    if (limit && now > limit) {
      const daysOverdue = Math.abs(daysUntilLimit ?? 0);
      urgency = 10 + Math.min(daysOverdue * 0.5, 10); // Max urgency of 20
      isOverdue = true;
    }
    // Alternative calculation: When target-limit distance is very small
    // Use proportional calculation from start to limit with x*ln(1+x) function
    // This accelerates as deadline approaches (similar to Case 2)
    else if (useAlternativeCalculation && target && limit && now < limit) {
      const dayMs = 1000 * 60 * 60 * 24;
      const daysPassed = Math.max(0, (now - created) / dayMs);
      const totalDays = Math.max(0, (limit - created) / dayMs);

      if (totalDays <= 0) {
        urgency = 10;
      } else if (daysPassed <= 0) {
        urgency = 0.5;
      } else {
        // Use x*ln(1+x) scaled to [0,10]
        // At x=1: f(1) = 1*ln(2) ≈ 0.693
        const fraction = Math.min(1, daysPassed / totalDays); // x in [0,1]
        const score = fraction * Math.log(1 + fraction);
        const maxScore = Math.log(2); // ≈ 0.693 when fraction = 1
        urgency = Math.min(10, (score / maxScore) * 10);
      }
    }
    // Case 2: Between target and limit
    else if (target && limit && now >= target && now <= limit) {
      // New rule: urgency between 6 and 10, growth at rate x * ln(1 + x)
      // where x = days passed since target
      const dayMs = 1000 * 60 * 60 * 24;
      const daysSinceTarget = Math.max(0, Math.floor((now - target) / dayMs));

      // Score using x * ln(1 + x) (smooth, increasing). Normalize to 0..1 by score/(1+score)
      const score = daysSinceTarget * Math.log(1 + daysSinceTarget);
      const normalized = score > 0 ? score / (1 + score) : 0;
      urgency = 6 + 4 * normalized; // maps into [6,10)
    }
    // Case 3: Before target date (between creation and target)
    else if (target && now < target) {
      // New rule: urgency between 0 and 6, grows at rate sqrt(x) where
      // x = days passed since creation. We'll normalize by total days to target
      // and apply sqrt to the fraction so urgency = 6 * sqrt(daysPassed/totalDays)
      const dayMs = 1000 * 60 * 60 * 24;
      const daysPassed = Math.max(0, (now - created) / dayMs);
      const totalDays = Math.max(0, (target - created) / dayMs);

      if (totalDays <= 0) {
        urgency = 6;
      } else if (daysPassed <= 0) {
        // just created
        urgency = 0.5;
      } else {
        const fraction = Math.min(1, daysPassed / totalDays);
        urgency = Math.min(6, 6 * Math.sqrt(fraction));
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

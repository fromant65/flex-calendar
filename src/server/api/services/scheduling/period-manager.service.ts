/**
 * Period Manager
 * 
 * Manages period boundaries, occurrence counters, and period transitions
 * for recurring tasks with maxOccurrences.
 */

import type { TaskRecurrence } from "../types";
import type { RecurrenceAdapter } from "../../adapter";

export class PeriodManager {
  constructor(private recurrenceAdapter: RecurrenceAdapter) {}

  /**
   * Get the end of the current period based on recurrence type
   */
  getPeriodEnd(
    periodStart: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): Date {
    if (recurrence.interval) {
      // Interval-based: add interval days
      const periodEnd = new Date(periodStart);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + recurrence.interval);
      return periodEnd;
    } else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      // Week-based: period is 7 days (one week)
      const periodEnd = new Date(periodStart);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);
      return periodEnd;
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      // Month-based: period ends at start of next month
      const year = periodStart.getUTCFullYear();
      const month = periodStart.getUTCMonth();
      const periodEnd = new Date(Date.UTC(year, month + 1, 1));
      return periodEnd;
    }
    
    // Default
    const periodEnd = new Date(periodStart);
    return periodEnd;
  }

  /**
   * Get the start of the next period based on recurrence type
   */
  getNextPeriodStartByType(
    currentPeriodStart: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): Date {
    if (recurrence.interval) {
      // Interval-based: add interval days
      const result = new Date(currentPeriodStart);
      result.setUTCDate(result.getUTCDate() + recurrence.interval);
      return result;
    } else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      // Week-based: add 7 days (one week)
      const result = new Date(currentPeriodStart);
      result.setUTCDate(result.getUTCDate() + 7);
      return result;
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      // Month-based: go to next month, use first day of month as period start
      const year = currentPeriodStart.getUTCFullYear();
      const month = currentPeriodStart.getUTCMonth();
      // Next period starts on the 1st of the next month
      const result = new Date(Date.UTC(year, month + 1, 1));
      return result;
    }
    
    // Default: return current period start (shouldn't happen)
    return new Date(currentPeriodStart);
  }

  /**
   * Check if max occurrences reached for current period
   */
  hasReachedPeriodLimit(recurrence: TaskRecurrence): boolean {
    if (!recurrence.maxOccurrences) return false;
    return (recurrence.completedOccurrences ?? 0) >= recurrence.maxOccurrences;
  }

  /**
   * Increment completed occurrences, handling period boundaries correctly
   */
  async incrementCompletedOccurrences(recurrenceId: number, occurrenceStartDate: Date): Promise<void> {
    const recurrence = await this.recurrenceAdapter.getRecurrenceById(recurrenceId);
    if (!recurrence) return;

    // Determine which period the occurrence belongs to
    const currentPeriodStart = recurrence.lastPeriodStart ?? new Date();
    const currentPeriodEnd = this.getPeriodEnd(currentPeriodStart, recurrence);

    // Check if the occurrence belongs to the current period
    const occurrenceInCurrentPeriod = 
      occurrenceStartDate >= currentPeriodStart && 
      occurrenceStartDate < currentPeriodEnd;

    if (occurrenceInCurrentPeriod) {
      // Increment in current period
      await this.recurrenceAdapter.updateRecurrence(recurrenceId, {
        completedOccurrences: (recurrence.completedOccurrences ?? 0) + 1,
      });
    }
    else if (occurrenceStartDate >= currentPeriodEnd) {
      // The occurrence is in a future period, advance to that period and set count to 1
      const nextPeriodStart = this.getNextPeriodStartByType(currentPeriodStart, recurrence);
      await this.recurrenceAdapter.updateRecurrence(recurrenceId, {
        completedOccurrences: 1,
        lastPeriodStart: nextPeriodStart,
      });
    }
    else {
      // Occurrence is from past period (backlog), don't increment counter
      return;
    }
  }

  /**
   * Update the recurrence period (advance to next period, reset counter)
   */
  async updateRecurrencePeriod(recurrence: TaskRecurrence, fromDate: Date): Promise<void> {
    const nextPeriodStart = this.getNextPeriodStartByType(
      recurrence.lastPeriodStart ?? fromDate,
      recurrence
    );

    await this.recurrenceAdapter.updateRecurrence(recurrence.id, {
      lastPeriodStart: nextPeriodStart,
      completedOccurrences: 0,
    });
  }

  /**
   * Check if should start a new period
   */
  shouldStartNewPeriod(recurrence: TaskRecurrence, fromDate: Date): boolean {
    if (!recurrence.maxOccurrences) return false;
    if (!recurrence.lastPeriodStart) return false;

    const periodEnd = this.getPeriodEnd(recurrence.lastPeriodStart, recurrence);
    return fromDate >= periodEnd;
  }
}

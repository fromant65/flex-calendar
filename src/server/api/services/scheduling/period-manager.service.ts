/**
 * Period Manager
 * 
 * Manages period boundaries, occurrence counters, and period transitions
 * for recurring tasks with maxOccurrences.
 * 
 * Refactored to use DateDomainService for consistent date handling
 */

import type { TaskRecurrence } from "../types";
import type { RecurrenceAdapter } from "../../adapter";
import { DateDomainService } from "../dates";

export class PeriodManager {
  private readonly dateService = new DateDomainService();

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
    const periodStartObj = this.dateService.dateToPeriodStart(periodStart);

    if (recurrence.interval) {
      // Interval-based: add interval days
      const periodEnd = this.dateService.calculatePeriodEnd(periodStartObj, 'interval', recurrence.interval);
      return periodEnd.toDate();
    } else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      // Week-based: period is 7 days (one week)
      const periodEnd = this.dateService.calculatePeriodEnd(periodStartObj, 'weekly');
      return periodEnd.toDate();
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      // Month-based: period ends at start of next month
      const periodEnd = this.dateService.calculatePeriodEnd(periodStartObj, 'monthly');
      return periodEnd.toDate();
    }
    
    // Default
    return periodStart;
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
    const periodStartObj = this.dateService.dateToPeriodStart(currentPeriodStart);

    if (recurrence.interval) {
      // Interval-based: add interval days
      const nextPeriod = this.dateService.calculateNextPeriod(periodStartObj, 'interval', recurrence.interval);
      return nextPeriod.toDate();
    } else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      // Week-based: add 7 days (one week)
      const nextPeriod = this.dateService.calculateNextPeriod(periodStartObj, 'weekly');
      return nextPeriod.toDate();
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      // Month-based: go to next month, use first day of month as period start
      const nextPeriod = this.dateService.calculateNextPeriod(periodStartObj, 'monthly');
      return nextPeriod.toDate();
    }
    
    // Default: return current period start (shouldn't happen)
    return currentPeriodStart;
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
    const currentPeriodStart = this.dateService.dateToDeadline(recurrence.lastPeriodStart ?? new Date());
    const currentPeriodEnd = this.dateService.dateToDeadline(
      this.getPeriodEnd(currentPeriodStart.toDate(), recurrence)
    );
    const occurrenceDate = this.dateService.dateToDeadline(occurrenceStartDate);

    // Check if the occurrence belongs to the current period
    const occurrenceInCurrentPeriod = 
      !occurrenceDate.isBefore(currentPeriodStart) && 
      occurrenceDate.isBefore(currentPeriodEnd);

    if (occurrenceInCurrentPeriod) {
      // Increment in current period
      await this.recurrenceAdapter.updateRecurrence(recurrenceId, {
        completedOccurrences: (recurrence.completedOccurrences ?? 0) + 1,
      });
    }
    else if (!occurrenceDate.isBefore(currentPeriodEnd)) {
      // The occurrence is in a future period, advance to that period and set count to 1
      const nextPeriodStart = this.getNextPeriodStartByType(currentPeriodStart.toDate(), recurrence);
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

    const periodEnd = this.dateService.dateToDeadline(
      this.getPeriodEnd(recurrence.lastPeriodStart, recurrence)
    );
    const currentDate = this.dateService.dateToDeadline(fromDate);
    
    return !currentDate.isBefore(periodEnd);
  }
}

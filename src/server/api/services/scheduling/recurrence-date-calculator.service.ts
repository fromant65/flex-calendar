/**
 * Recurrence Date Calculator
 * 
 * Handles all date calculations for recurring tasks based on different recurrence patterns:
 * - Interval-based (every N days)
 * - Days of week (e.g., Mon, Wed, Fri)
 * - Days of month (e.g., 1st, 15th, 30th)
 * 
 * Refactored to use DateDomainService for consistent date handling
 */

import type { DayOfWeek } from "../types";
import { DateDomainService, Deadline } from "../dates";

export class RecurrenceDateCalculator {
  private readonly dateService = new DateDomainService();
  private readonly DAY_MAP: Record<DayOfWeek, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  /**
   * Calculate the next occurrence date based on recurrence pattern
   */
  calculateNextOccurrenceDate(
    lastOccurrenceDate: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
      maxOccurrences?: number | null;
      completedOccurrences?: number | null;
    }
  ): Date {
    const lastDeadline = this.dateService.dateToDeadline(lastOccurrenceDate);

    // Case 1: Interval-based (every N days/weeks/months)
    if (recurrence.interval) {
      if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1) {
        const distributedInterval = Math.floor(recurrence.interval / recurrence.maxOccurrences);
        const nextDeadline = this.dateService.addDays(lastDeadline, distributedInterval);
        return nextDeadline.toDate();
      } else {
        const nextDeadline = this.dateService.addDays(lastDeadline, recurrence.interval);
        return nextDeadline.toDate();
      }
    }

    // Case 2: Specific days of week
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      return this.getNextDayOfWeek(lastOccurrenceDate, recurrence.daysOfWeek as DayOfWeek[]);
    }

    // Case 3: Specific days of month
    if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      return this.getNextDayOfMonth(lastOccurrenceDate, recurrence.daysOfMonth);
    }

    // Default: next day
    const nextDeadline = this.dateService.addDays(lastDeadline, 1);
    return nextDeadline.toDate();
  }

  /**
   * Calculate target and limit dates for an occurrence
   */
  calculateOccurrenceDates(
    startDate: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): { targetDate: Date; limitDate: Date } {
    const startDeadline = this.dateService.dateToDeadline(startDate);

    if (recurrence.interval) {
      const targetDays = Math.floor(recurrence.interval * 0.6);
      const limitDays = recurrence.interval;
      const targetDeadline = this.dateService.addDays(startDeadline, targetDays);
      const limitDeadline = this.dateService.addDays(startDeadline, limitDays);
      return { targetDate: targetDeadline.toDate(), limitDate: limitDeadline.toDate() };
    } 
    else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      const nextOccurrence = this.calculateNextOccurrenceDate(startDate, recurrence);
      const nextDeadline = this.dateService.dateToDeadline(nextOccurrence);
      const daysUntilNext = this.dateService.calculateDaysBetween(startDeadline, nextDeadline);
      const targetDeadline = this.dateService.addDays(startDeadline, Math.max(1, Math.floor(daysUntilNext * 0.6)));
      return { targetDate: targetDeadline.toDate(), limitDate: nextOccurrence };
    }
    else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      const nextOccurrence = this.calculateNextOccurrenceDate(startDate, recurrence);
      const nextDeadline = this.dateService.dateToDeadline(nextOccurrence);
      const daysUntilNext = this.dateService.calculateDaysBetween(startDeadline, nextDeadline);
      const targetDeadline = this.dateService.addDays(startDeadline, Math.max(1, Math.floor(daysUntilNext * 0.6)));
      return { targetDate: targetDeadline.toDate(), limitDate: nextOccurrence };
    }
    else {
      const targetDeadline = this.dateService.addDays(startDeadline, 1);
      const limitDeadline = this.dateService.addDays(startDeadline, 7);
      return { targetDate: targetDeadline.toDate(), limitDate: limitDeadline.toDate() };
    }
  }

  /**
   * Get the next occurrence of specified days of week
   */
  getNextDayOfWeek(fromDate: Date, daysOfWeek: DayOfWeek[]): Date {
    const targetDays = daysOfWeek.map((day) => this.DAY_MAP[day]).sort((a, b) => a - b);
    const fromDeadline = this.dateService.dateToDeadline(fromDate);
    const currentDay = fromDeadline.getDayOfWeek();

    let daysToAdd = 0;
    let found = false;

    for (const targetDay of targetDays) {
      if (targetDay > currentDay) {
        daysToAdd = targetDay - currentDay;
        found = true;
        break;
      }
    }

    if (!found) {
      daysToAdd = 7 - currentDay + targetDays[0]!;
    }

    const nextDeadline = this.dateService.addDays(fromDeadline, daysToAdd);
    return nextDeadline.toDate();
  }

  /**
   * Get the first occurrence of specified days of week in a period
   */
  getFirstDayOfWeekInPeriod(periodStart: Date, daysOfWeek: DayOfWeek[]): Date {
    const targetDays = daysOfWeek.map((day) => this.DAY_MAP[day]).sort((a, b) => a - b);
    const periodDeadline = this.dateService.dateToDeadline(periodStart);
    const periodStartDay = periodDeadline.getDayOfWeek();
    
    for (const targetDay of targetDays) {
      if (targetDay >= periodStartDay) {
        const daysToAdd = targetDay - periodStartDay;
        const nextDeadline = this.dateService.addDays(periodDeadline, daysToAdd);
        return nextDeadline.toDate();
      }
    }
    
    const daysToAdd = 7 - periodStartDay + targetDays[0]!;
    const nextDeadline = this.dateService.addDays(periodDeadline, daysToAdd);
    return nextDeadline.toDate();
  }

  /**
   * Get the next occurrence of specified days of month
   */
  getNextDayOfMonth(fromDate: Date, daysOfMonth: number[]): Date {
    const sortedDays = [...daysOfMonth].sort((a, b) => a - b);
    const fromDeadline = this.dateService.dateToDeadline(fromDate);
    const currentDay = fromDeadline.getDayOfMonth();
    const components = fromDeadline.getComponents();

    // Try current month
    for (const day of sortedDays) {
      if (day > currentDay) {
        try {
          // Use Date.UTC directly to check if the day is valid for this month
          const testDate = new Date(Date.UTC(components.year, components.month - 1, day));
          // Verify the month didn't overflow
          if (testDate.getUTCMonth() === components.month - 1) {
            return testDate;
          }
        } catch {
          // Invalid date, continue to next
          continue;
        }
      }
    }

    // Try next month
    const nextMonth = components.month % 12; // 1-12 -> next month (wraps to 0 for Dec->Jan)
    const nextYear = components.month === 12 ? components.year + 1 : components.year;
    for (const day of sortedDays) {
      try {
        const testDate = new Date(Date.UTC(nextYear, nextMonth, day));
        // Verify the month didn't overflow
        if (testDate.getUTCMonth() === nextMonth) {
          return testDate;
        }
      } catch {
        continue;
      }
    }

    // Fallback to month after next
    const monthAfterNext = (components.month + 1) % 12;
    const yearAfterNext = components.month >= 11 ? components.year + 1 : components.year;
    const fallbackDate = new Date(Date.UTC(yearAfterNext, monthAfterNext, sortedDays[0]!));
    return fallbackDate;
  }

  /**
   * Get the first occurrence of specified days of month in a period
   */
  getFirstDayOfMonthInPeriod(periodStart: Date, daysOfMonth: number[]): Date {
    const sortedDays = [...daysOfMonth].sort((a, b) => a - b);
    const periodDeadline = this.dateService.dateToDeadline(periodStart);
    const periodStartDay = periodDeadline.getDayOfMonth();
    const components = periodDeadline.getComponents();

    // Try current month
    for (const day of sortedDays) {
      if (day >= periodStartDay) {
        try {
          // Use Date.UTC directly to check if the day is valid for this month
          const testDate = new Date(Date.UTC(components.year, components.month - 1, day));
          // Verify the month didn't overflow
          if (testDate.getUTCMonth() === components.month - 1) {
            return testDate;
          }
        } catch {
          continue;
        }
      }
    }

    // Try next month
    const nextMonth = components.month % 12;
    const nextYear = components.month === 12 ? components.year + 1 : components.year;
    for (const day of sortedDays) {
      try {
        const testDate = new Date(Date.UTC(nextYear, nextMonth, day));
        // Verify the month didn't overflow
        if (testDate.getUTCMonth() === nextMonth) {
          return testDate;
        }
      } catch {
        continue;
      }
    }

    // Fallback to month after next
    const monthAfterNext = (components.month + 1) % 12;
    const yearAfterNext = components.month >= 11 ? components.year + 1 : components.year;
    const fallbackDate = new Date(Date.UTC(yearAfterNext, monthAfterNext, sortedDays[0]!));
    return fallbackDate;
  }
}

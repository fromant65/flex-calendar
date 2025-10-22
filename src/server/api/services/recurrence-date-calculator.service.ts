/**
 * Recurrence Date Calculator
 * 
 * Handles all date calculations for recurring tasks based on different recurrence patterns:
 * - Interval-based (every N days)
 * - Days of week (e.g., Mon, Wed, Fri)
 * - Days of month (e.g., 1st, 15th, 30th)
 */

import type { DayOfWeek } from "./types";

export class RecurrenceDateCalculator {
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
    const nextDate = new Date(lastOccurrenceDate);

    // Case 1: Interval-based (every N days/weeks/months)
    if (recurrence.interval) {
      if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1) {
        const distributedInterval = Math.floor(recurrence.interval / recurrence.maxOccurrences);
        nextDate.setDate(nextDate.getDate() + distributedInterval);
      } else {
        nextDate.setDate(nextDate.getDate() + recurrence.interval);
      }
      return nextDate;
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
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
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
    const targetDate = new Date(startDate);
    const limitDate = new Date(startDate);

    if (recurrence.interval) {
      const targetDays = Math.floor(recurrence.interval * 0.6);
      const limitDays = recurrence.interval;
      targetDate.setDate(targetDate.getDate() + targetDays);
      limitDate.setDate(limitDate.getDate() + limitDays);
    } 
    else if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      const nextOccurrence = this.calculateNextOccurrenceDate(startDate, recurrence);
      const daysUntilNext = Math.floor((nextOccurrence.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      targetDate.setDate(targetDate.getDate() + Math.max(1, Math.floor(daysUntilNext * 0.6)));
      limitDate.setTime(nextOccurrence.getTime());
    }
    else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      const nextOccurrence = this.calculateNextOccurrenceDate(startDate, recurrence);
      const daysUntilNext = Math.floor((nextOccurrence.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      targetDate.setDate(targetDate.getDate() + Math.max(1, Math.floor(daysUntilNext * 0.6)));
      limitDate.setTime(nextOccurrence.getTime());
    }
    else {
      targetDate.setDate(targetDate.getDate() + 1);
      limitDate.setDate(limitDate.getDate() + 7);
    }

    return { targetDate, limitDate };
  }

  /**
   * Get the next occurrence of specified days of week
   */
  getNextDayOfWeek(fromDate: Date, daysOfWeek: DayOfWeek[]): Date {
    const targetDays = daysOfWeek.map((day) => this.DAY_MAP[day]).sort((a, b) => a - b);
    const currentDay = fromDate.getUTCDay();
    const currentYear = fromDate.getUTCFullYear();
    const currentMonth = fromDate.getUTCMonth();
    const currentDate = fromDate.getUTCDate();

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

    return new Date(Date.UTC(currentYear, currentMonth, currentDate + daysToAdd));
  }

  /**
   * Get the first occurrence of specified days of week in a period
   */
  getFirstDayOfWeekInPeriod(periodStart: Date, daysOfWeek: DayOfWeek[]): Date {
    const targetDays = daysOfWeek.map((day) => this.DAY_MAP[day]).sort((a, b) => a - b);
    const periodStartDay = periodStart.getUTCDay();
    const periodStartYear = periodStart.getUTCFullYear();
    const periodStartMonth = periodStart.getUTCMonth();
    const periodStartDate = periodStart.getUTCDate();
    
    for (const targetDay of targetDays) {
      if (targetDay >= periodStartDay) {
        const daysToAdd = targetDay - periodStartDay;
        return new Date(Date.UTC(periodStartYear, periodStartMonth, periodStartDate + daysToAdd));
      }
    }
    
    const daysToAdd = 7 - periodStartDay + targetDays[0]!;
    return new Date(Date.UTC(periodStartYear, periodStartMonth, periodStartDate + daysToAdd));
  }

  /**
   * Get the next occurrence of specified days of month
   */
  getNextDayOfMonth(fromDate: Date, daysOfMonth: number[]): Date {
    const sortedDays = [...daysOfMonth].sort((a, b) => a - b);
    const currentDay = fromDate.getUTCDate();
    const currentMonth = fromDate.getUTCMonth();
    const currentYear = fromDate.getUTCFullYear();

    // Try current month
    for (const day of sortedDays) {
      if (day > currentDay) {
        const testDate = new Date(Date.UTC(currentYear, currentMonth, day));
        if (testDate.getUTCMonth() === currentMonth) {
          return testDate;
        }
      }
    }

    // Try next month
    const nextMonth = currentMonth + 1;
    for (const day of sortedDays) {
      const testDate = new Date(Date.UTC(currentYear, nextMonth, day));
      if (testDate.getUTCMonth() === (nextMonth % 12)) {
        return testDate;
      }
    }

    // Fallback
    return new Date(Date.UTC(currentYear, currentMonth + 2, sortedDays[0]!));
  }

  /**
   * Get the first occurrence of specified days of month in a period
   */
  getFirstDayOfMonthInPeriod(periodStart: Date, daysOfMonth: number[]): Date {
    const sortedDays = [...daysOfMonth].sort((a, b) => a - b);
    const periodStartDay = periodStart.getUTCDate();
    const periodStartMonth = periodStart.getUTCMonth();
    const periodStartYear = periodStart.getUTCFullYear();

    // Try current month
    for (const day of sortedDays) {
      if (day >= periodStartDay) {
        const testDate = new Date(Date.UTC(periodStartYear, periodStartMonth, day));
        if (testDate.getUTCMonth() === periodStartMonth) {
          return testDate;
        }
      }
    }

    // Try next month
    const nextMonth = periodStartMonth + 1;
    for (const day of sortedDays) {
      const testDate = new Date(Date.UTC(periodStartYear, nextMonth, day));
      if (testDate.getUTCMonth() === (nextMonth % 12)) {
        return testDate;
      }
    }

    // Fallback
    return new Date(Date.UTC(periodStartYear, periodStartMonth + 2, sortedDays[0]!));
  }
}

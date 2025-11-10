/**
 * DateDomainService
 * 
 * Facade for all date operations in the application.
 * Provides a unified interface for date manipulation across the application.
 * Coordinates between value objects and utilities to provide high-level operations.
 */

import { EventTime } from './value-objects/event-time.vo';
import { Deadline } from './value-objects/deadline.vo';
import { PeriodStart } from './value-objects/period-start.vo';
import { Timestamp } from './value-objects/timestamp.vo';
import { DateCalculator } from './utils/date-calculator';
import { DateComparator } from './utils/date-comparator';
import { DateFormatter } from './utils/date-formatter';
import type {
  DateTimeComponents,
  DateComponents,
  DurationComponents,
  DateFormatStyle,
  PeriodType,
} from './types';

export class DateDomainService {
  // ==================== Factory Methods ====================

  /**
   * Create EventTime from various inputs
   */
  createEventTime(
    input:
      | Date
      | string
      | DateTimeComponents
      | 'now'
  ): EventTime {
    if (input === 'now') {
      return EventTime.now();
    } else if (input instanceof Date) {
      return EventTime.fromLocal(input);
    } else if (typeof input === 'string') {
      return EventTime.fromUTC(input);
    } else {
      return EventTime.fromComponents(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.millisecond
      );
    }
  }

  /**
   * Create Deadline from various inputs
   */
  createDeadline(
    input:
      | Date
      | string
      | DateComponents
      | 'today'
      | 'tomorrow'
  ): Deadline {
    if (input === 'today') {
      return Deadline.today();
    } else if (input === 'tomorrow') {
      return Deadline.tomorrow();
    } else if (input instanceof Date) {
      return Deadline.fromDate(input);
    } else if (typeof input === 'string') {
      return Deadline.fromUTC(input);
    } else {
      return Deadline.fromComponents(input.year, input.month, input.day);
    }
  }

  /**
   * Create Deadline N days from now
   */
  createDeadlineFromNow(days: number): Deadline {
    return Deadline.daysFromNow(days);
  }

  /**
   * Create PeriodStart
   */
  createPeriodStart(
    input: Date | string | DateComponents | 'today'
  ): PeriodStart {
    if (input === 'today') {
      return PeriodStart.today();
    } else if (input instanceof Date) {
      return PeriodStart.fromDate(input);
    } else if (typeof input === 'string') {
      return PeriodStart.fromUTC(input);
    } else {
      return PeriodStart.fromComponents(input.year, input.month, input.day);
    }
  }

  /**
   * Create Timestamp
   */
  createTimestamp(input?: Date | string | number | 'now'): Timestamp {
    if (!input || input === 'now') {
      return Timestamp.now();
    } else if (input instanceof Date) {
      return Timestamp.fromDate(input);
    } else if (typeof input === 'string') {
      return Timestamp.fromUTC(input);
    } else {
      return Timestamp.fromMillis(input);
    }
  }

  // ==================== Calculations ====================

  /**
   * Calculate event duration
   */
  calculateEventDuration(start: EventTime, end: EventTime): DurationComponents {
    return DateCalculator.duration(start, end);
  }

  /**
   * Calculate days between deadlines
   */
  calculateDaysBetween(start: Deadline, end: Deadline): number {
    return DateCalculator.daysBetween(start, end);
  }

  /**
   * Add days to deadline
   */
  addDays(deadline: Deadline, days: number): Deadline {
    return DateCalculator.addDays(deadline, days);
  }

  /**
   * Add months to deadline
   */
  addMonths(deadline: Deadline, months: number): Deadline {
    return DateCalculator.addMonths(deadline, months);
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  getDayOfWeek(deadline: Deadline): number {
    return DateCalculator.getDayOfWeek(deadline);
  }

  /**
   * Get day of month (1-31)
   */
  getDayOfMonth(deadline: Deadline): number {
    return DateCalculator.getDayOfMonth(deadline);
  }

  /**
   * Get week number in year (ISO 8601)
   */
  getWeekNumber(deadline: Deadline): number {
    return DateCalculator.getWeekNumber(deadline);
  }

  /**
   * Check if year is leap year
   */
  isLeapYear(year: number): boolean {
    return DateCalculator.isLeapYear(year);
  }

  /**
   * Get days in month
   */
  getDaysInMonth(year: number, month: number): number {
    return DateCalculator.daysInMonth(year, month);
  }

  // ==================== Comparisons ====================

  /**
   * Sort event times
   */
  sortEventTimes(times: EventTime[]): EventTime[] {
    return DateComparator.sortEventTimes(times);
  }

  /**
   * Sort deadlines
   */
  sortDeadlines(deadlines: Deadline[]): Deadline[] {
    return DateComparator.sortDeadlines(deadlines);
  }

  /**
   * Sort timestamps
   */
  sortTimestamps(timestamps: Timestamp[]): Timestamp[] {
    return DateComparator.sortTimestamps(timestamps);
  }

  /**
   * Find earliest event time
   */
  findEarliest(...times: EventTime[]): EventTime {
    return DateComparator.earliest(...times);
  }

  /**
   * Find latest event time
   */
  findLatest(...times: EventTime[]): EventTime {
    return DateComparator.latest(...times);
  }

  /**
   * Find earliest deadline
   */
  findEarliestDeadline(...deadlines: Deadline[]): Deadline {
    return DateComparator.earliestDeadline(...deadlines);
  }

  /**
   * Find latest deadline
   */
  findLatestDeadline(...deadlines: Deadline[]): Deadline {
    return DateComparator.latestDeadline(...deadlines);
  }

  /**
   * Check if date is between two dates
   */
  isBetween(date: Date, start: Date, end: Date): boolean {
    return DateComparator.isBetween(date, start, end);
  }

  /**
   * Check if two date ranges overlap
   */
  rangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return DateComparator.rangesOverlap(start1, end1, start2, end2);
  }

  // ==================== Formatting ====================

  /**
   * Format event time for display
   */
  formatEventTime(time: EventTime, format?: DateFormatStyle, locale?: string): string {
    return DateFormatter.formatEventTime(time, format, locale);
  }

  /**
   * Format deadline for display
   */
  formatDeadline(deadline: Deadline, format?: DateFormatStyle, locale?: string): string {
    return DateFormatter.formatDeadline(deadline, format, locale);
  }

  /**
   * Format deadline with relative time
   */
  formatDeadlineRelative(deadline: Deadline, locale?: string): string {
    return DateFormatter.formatDeadlineRelative(deadline, locale);
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: Timestamp, format?: DateFormatStyle, locale?: string): string {
    return DateFormatter.formatTimestamp(timestamp, format, locale);
  }

  /**
   * Format duration
   */
  formatDuration(milliseconds: number): string {
    return DateFormatter.formatDuration(milliseconds);
  }

  /**
   * Format duration in long form
   */
  formatDurationLong(milliseconds: number): string {
    return DateFormatter.formatDurationLong(milliseconds);
  }

  /**
   * Format date range
   */
  formatDateRange(start: Deadline, end: Deadline, locale?: string): string {
    return DateFormatter.formatDateRange(start, end, locale);
  }

  /**
   * Format time range
   */
  formatTimeRange(start: EventTime, end: EventTime, locale?: string): string {
    return DateFormatter.formatTimeRange(start, end, locale);
  }

  /**
   * Format as ISO date string (YYYY-MM-DD)
   */
  toISODate(deadline: Deadline): string {
    return DateFormatter.toISODate(deadline);
  }

  /**
   * Format as ISO time string (HH:MM:SS)
   */
  toISOTime(time: EventTime): string {
    return DateFormatter.toISOTime(time);
  }

  // ==================== Validation ====================

  /**
   * Validate that end time is after start time
   */
  validateEventTimeRange(start: EventTime, end: EventTime): { valid: boolean; error?: string } {
    if (!start.isBefore(end)) {
      return {
        valid: false,
        error: 'End time must be after start time',
      };
    }
    return { valid: true };
  }

  /**
   * Validate that deadline is in the future
   */
  validateDeadlineInFuture(deadline: Deadline): { valid: boolean; error?: string } {
    if (deadline.isPast()) {
      return {
        valid: false,
        error: 'Deadline must be in the future',
      };
    }
    return { valid: true };
  }

  /**
   * Validate that deadline is not too far in the future
   */
  validateDeadlineNotTooFar(
    deadline: Deadline,
    maxDays: number
  ): { valid: boolean; error?: string } {
    const daysUntil = deadline.daysUntil();
    if (daysUntil > maxDays) {
      return {
        valid: false,
        error: `Deadline cannot be more than ${maxDays} days in the future`,
      };
    }
    return { valid: true };
  }

  // ==================== Period Management ====================

  /**
   * Calculate next period start
   */
  calculateNextPeriod(
    currentPeriod: PeriodStart,
    type: PeriodType,
    intervalDays?: number
  ): PeriodStart {
    switch (type) {
      case 'interval':
        if (!intervalDays) throw new Error('Interval days required for interval period type');
        return currentPeriod.nextPeriod(intervalDays);
      case 'weekly':
        return currentPeriod.nextWeek();
      case 'monthly':
        return currentPeriod.nextMonth();
    }
  }

  /**
   * Calculate period end
   */
  calculatePeriodEnd(
    periodStart: PeriodStart,
    type: PeriodType,
    intervalDays?: number
  ): Deadline {
    switch (type) {
      case 'interval':
        if (!intervalDays) throw new Error('Interval days required for interval period type');
        return periodStart.periodEnd(intervalDays);
      case 'weekly':
        return periodStart.weekEnd();
      case 'monthly':
        return periodStart.monthEnd();
    }
  }

  /**
   * Check if date is in current period
   */
  isInPeriod(date: Date, periodStart: PeriodStart, intervalDays: number): boolean {
    return periodStart.isInPeriod(date, intervalDays);
  }

  // ==================== Convenience Methods ====================

  /**
   * Get current date as Deadline
   */
  today(): Deadline {
    return Deadline.today();
  }

  /**
   * Get tomorrow's date as Deadline
   */
  tomorrow(): Deadline {
    return Deadline.tomorrow();
  }

  /**
   * Get current timestamp
   */
  now(): Timestamp {
    return Timestamp.now();
  }

  /**
   * Get current event time
   */
  currentEventTime(): EventTime {
    return EventTime.now();
  }

  /**
   * Convert Date to EventTime
   */
  dateToEventTime(date: Date): EventTime {
    return EventTime.fromLocal(date);
  }

  /**
   * Convert Date to Deadline
   */
  dateToDeadline(date: Date): Deadline {
    return Deadline.fromDate(date);
  }

  /**
   * Convert Date to Timestamp
   */
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Convert Date to PeriodStart
   */
  dateToPeriodStart(date: Date): PeriodStart {
    return PeriodStart.fromDate(date);
  }
}

/**
 * PeriodStart Value Object
 * 
 * Marks the start of a period for recurring tasks/habits.
 * Used for period-based calculations.
 */

import { Deadline } from './deadline.vo';

export class PeriodStart {
  private readonly deadline: Deadline;

  private constructor(deadline: Deadline) {
    this.deadline = deadline;
  }

  /**
   * Create from Date
   */
  static fromDate(date: Date): PeriodStart {
    return new PeriodStart(Deadline.fromDate(date));
  }

  /**
   * Create from UTC ISO string
   */
  static fromUTC(isoString: string): PeriodStart {
    return new PeriodStart(Deadline.fromUTC(isoString));
  }

  /**
   * Create from components
   */
  static fromComponents(year: number, month: number, day: number): PeriodStart {
    return new PeriodStart(Deadline.fromComponents(year, month, day));
  }

  /**
   * Create for today
   */
  static today(): PeriodStart {
    return new PeriodStart(Deadline.today());
  }

  /**
   * Calculate next period start based on interval
   */
  nextPeriod(intervalDays: number): PeriodStart {
    return new PeriodStart(this.deadline.addDays(intervalDays));
  }

  /**
   * Calculate next week period start
   */
  nextWeek(): PeriodStart {
    return new PeriodStart(this.deadline.addDays(7));
  }

  /**
   * Calculate next month period start
   */
  nextMonth(): PeriodStart {
    const { year, month } = this.deadline.getComponents();
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    return new PeriodStart(Deadline.fromComponents(nextYear, nextMonth, 1));
  }

  /**
   * Calculate period end based on interval
   */
  periodEnd(intervalDays: number): Deadline {
    return this.deadline.addDays(intervalDays);
  }

  /**
   * Get period end for weekly periods
   */
  weekEnd(): Deadline {
    return this.deadline.addDays(7);
  }

  /**
   * Get period end for monthly periods
   */
  monthEnd(): Deadline {
    const { year, month } = this.deadline.getComponents();
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    return Deadline.fromComponents(nextYear, nextMonth, 1);
  }

  /**
   * Check if a date is within this period
   */
  isInPeriod(date: Date, intervalDays: number): boolean {
    const deadline = Deadline.fromDate(date);
    const periodEnd = this.periodEnd(intervalDays);
    return !deadline.isBefore(this.deadline) && deadline.isBefore(periodEnd);
  }

  /**
   * Check if this period start is before another
   */
  isBefore(other: PeriodStart): boolean {
    return this.deadline.isBefore(other.deadline);
  }

  /**
   * Check if this period start is after another
   */
  isAfter(other: PeriodStart): boolean {
    return this.deadline.isAfter(other.deadline);
  }

  /**
   * Check equality with another PeriodStart
   */
  equals(other: PeriodStart): boolean {
    return this.deadline.equals(other.deadline);
  }

  /**
   * Get as Date
   */
  toUTC(): Date {
    return this.deadline.toUTC();
  }

  /**
   * Get as ISO string
   */
  toISOString(): string {
    return this.deadline.toISOString();
  }

  /**
   * Format for display
   */
  format(locale?: string): string {
    return this.deadline.format(locale);
  }

  /**
   * Get components
   */
  getComponents(): { year: number; month: number; day: number } {
    return this.deadline.getComponents();
  }

  /**
   * Get day of week
   */
  getDayOfWeek(): number {
    return this.deadline.getDayOfWeek();
  }

  /**
   * Get timestamp
   */
  getTime(): number {
    return this.deadline.getTime();
  }

  /**
   * Convert to JavaScript Date object
   */
  toDate(): Date {
    return this.deadline.toDate();
  }
}

/**
 * DateCalculator
 * 
 * Utility for date calculations
 */

import { EventTime } from '../value-objects/event-time.vo';
import { Deadline } from '../value-objects/deadline.vo';
import type { DurationComponents } from '../types';

export class DateCalculator {
  /**
   * Calculate duration between two EventTimes
   */
  static duration(start: EventTime, end: EventTime): DurationComponents {
    const ms = end.diff(start);
    return {
      milliseconds: ms,
      seconds: Math.floor(ms / 1000),
      minutes: Math.floor(ms / (1000 * 60)),
      hours: ms / (1000 * 60 * 60),
      days: ms / (1000 * 60 * 60 * 24),
    };
  }

  /**
   * Calculate days between two deadlines
   */
  static daysBetween(start: Deadline, end: Deadline): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Add days to deadline
   */
  static addDays(deadline: Deadline, days: number): Deadline {
    return deadline.addDays(days);
  }

  /**
   * Add months to deadline
   */
  static addMonths(deadline: Deadline, months: number): Deadline {
    const components = deadline.getComponents();
    let { year, month, day } = components;

    month += months;
    while (month > 12) {
      month -= 12;
      year += 1;
    }
    while (month < 1) {
      month += 12;
      year -= 1;
    }

    // Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
    const daysInMonth = this.daysInMonth(year, month);
    if (day > daysInMonth) {
      day = daysInMonth;
    }

    return Deadline.fromComponents(year, month, day);
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  static getDayOfWeek(deadline: Deadline): number {
    return deadline.getDayOfWeek();
  }

  /**
   * Get day of month (1-31)
   */
  static getDayOfMonth(deadline: Deadline): number {
    return deadline.getDayOfMonth();
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get days in month
   */
  static daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get week number in year (ISO 8601)
   */
  static getWeekNumber(deadline: Deadline): number {
    const date = deadline.toUTC();
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNum;
  }

  /**
   * Calculate the difference between two timestamps in a specific unit
   */
  static timeDiff(
    start: Date,
    end: Date,
    unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'
  ): number {
    const diffMs = end.getTime() - start.getTime();
    
    switch (unit) {
      case 'milliseconds':
        return diffMs;
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return diffMs / (1000 * 60 * 60);
      case 'days':
        return diffMs / (1000 * 60 * 60 * 24);
    }
  }

  /**
   * Get start of day (midnight) for a given date
   */
  static startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get end of day (23:59:59.999) for a given date
   */
  static endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Get start of week (Monday) for a given date
   */
  static startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get start of month for a given date
   */
  static startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }
}

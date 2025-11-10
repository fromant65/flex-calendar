/**
 * Date Domain Types
 * 
 * Type definitions for the date domain service
 */

export type DateInput = Date | string | number;

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodInfo {
  start: Date;
  end: Date;
  intervalDays: number;
}

export interface DeadlineStatus {
  deadline: Date;
  daysUntil: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  urgencyLevel: 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later';
}

export interface DateComponents {
  year: number;
  month: number; // 1-12
  day: number;
}

export interface TimeComponents {
  hour: number;
  minute: number;
  second?: number;
  millisecond?: number;
}

export interface DateTimeComponents extends DateComponents, TimeComponents {}

export interface DurationComponents {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days?: number;
}

export type DateFormatStyle = 'short' | 'medium' | 'long';

export type PeriodType = 'interval' | 'weekly' | 'monthly';

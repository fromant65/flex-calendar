/**
 * DateComparator
 * 
 * Utility for comparing and sorting dates
 */

import { EventTime } from '../value-objects/event-time.vo';
import { Deadline } from '../value-objects/deadline.vo';
import { Timestamp } from '../value-objects/timestamp.vo';

export class DateComparator {
  /**
   * Compare two EventTimes (for sorting)
   * Returns: -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compareEventTimes(a: EventTime, b: EventTime): number {
    const diff = a.getTime() - b.getTime();
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  /**
   * Compare two Deadlines
   */
  static compareDeadlines(a: Deadline, b: Deadline): number {
    if (a.isBefore(b)) return -1;
    if (a.isAfter(b)) return 1;
    return 0;
  }

  /**
   * Compare two Timestamps
   */
  static compareTimestamps(a: Timestamp, b: Timestamp): number {
    const diff = a.getTime() - b.getTime();
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  /**
   * Compare two Dates
   */
  static compareDates(a: Date, b: Date): number {
    const diff = a.getTime() - b.getTime();
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  /**
   * Sort array of EventTimes (ascending)
   */
  static sortEventTimes(times: EventTime[]): EventTime[] {
    return [...times].sort(this.compareEventTimes);
  }

  /**
   * Sort array of Deadlines (ascending)
   */
  static sortDeadlines(deadlines: Deadline[]): Deadline[] {
    return [...deadlines].sort(this.compareDeadlines);
  }

  /**
   * Sort array of Timestamps (ascending)
   */
  static sortTimestamps(timestamps: Timestamp[]): Timestamp[] {
    return [...timestamps].sort(this.compareTimestamps);
  }

  /**
   * Sort array of Dates (ascending)
   */
  static sortDates(dates: Date[]): Date[] {
    return [...dates].sort(this.compareDates);
  }

  /**
   * Find earliest EventTime
   */
  static earliest(...times: EventTime[]): EventTime {
    if (times.length === 0) throw new Error('No times provided');
    return times.reduce((earliest, current) =>
      current.isBefore(earliest) ? current : earliest
    );
  }

  /**
   * Find latest EventTime
   */
  static latest(...times: EventTime[]): EventTime {
    if (times.length === 0) throw new Error('No times provided');
    return times.reduce((latest, current) =>
      current.isAfter(latest) ? current : latest
    );
  }

  /**
   * Find earliest Deadline
   */
  static earliestDeadline(...deadlines: Deadline[]): Deadline {
    if (deadlines.length === 0) throw new Error('No deadlines provided');
    return deadlines.reduce((earliest, current) =>
      current.isBefore(earliest) ? current : earliest
    );
  }

  /**
   * Find latest Deadline
   */
  static latestDeadline(...deadlines: Deadline[]): Deadline {
    if (deadlines.length === 0) throw new Error('No deadlines provided');
    return deadlines.reduce((latest, current) =>
      current.isAfter(latest) ? current : latest
    );
  }

  /**
   * Check if date is between two dates (inclusive)
   */
  static isBetween(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  /**
   * Check if two date ranges overlap
   */
  static rangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 <= end2 && start2 <= end1;
  }
}

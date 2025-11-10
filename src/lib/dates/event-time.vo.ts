/**
 * EventTime Value Object
 * 
 * Represents a specific date and time for calendar events.
 * Internally stored in UTC, converts to/from user timezone.
 */

export class EventTime {
  private readonly utcDate: Date;

  private constructor(utcDate: Date) {
    this.utcDate = new Date(utcDate);
  }

  /**
   * Create from user's local date-time
   * @param localDateTime Date in user's timezone
   */
  static fromLocal(localDateTime: Date): EventTime {
    return new EventTime(new Date(localDateTime.toISOString()));
  }

  /**
   * Create from UTC ISO string (from database)
   * @param isoString ISO 8601 string in UTC
   */
  static fromUTC(isoString: string): EventTime {
    return new EventTime(new Date(isoString));
  }

  /**
   * Create from date and time components in UTC
   */
  static fromComponents(
    year: number,
    month: number, // 1-12
    day: number,
    hour: number,
    minute: number,
    second: number = 0,
    millisecond: number = 0
  ): EventTime {
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
    return new EventTime(date);
  }

  /**
   * Create EventTime for now
   */
  static now(): EventTime {
    return new EventTime(new Date());
  }

  /**
   * Get as Date object in UTC
   */
  toUTC(): Date {
    return new Date(this.utcDate);
  }

  /**
   * Get as ISO string for database storage
   */
  toISOString(): string {
    return this.utcDate.toISOString();
  }

  /**
   * Get as Date object in user's local timezone
   */
  toLocal(): Date {
    return new Date(this.utcDate.getTime());
  }

  /**
   * Format for display in user's locale
   */
  format(locale: string = 'es-AR', options?: Intl.DateTimeFormatOptions): string {
    return this.toLocal().toLocaleString(locale, options);
  }

  /**
   * Get timestamp in milliseconds
   */
  getTime(): number {
    return this.utcDate.getTime();
  }

  /**
   * Get UTC date components
   */
  getComponents(): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  } {
    return {
      year: this.utcDate.getUTCFullYear(),
      month: this.utcDate.getUTCMonth() + 1,
      day: this.utcDate.getUTCDate(),
      hour: this.utcDate.getUTCHours(),
      minute: this.utcDate.getUTCMinutes(),
      second: this.utcDate.getUTCSeconds(),
    };
  }

  /**
   * Check if this time is before another
   */
  isBefore(other: EventTime): boolean {
    return this.utcDate < other.utcDate;
  }

  /**
   * Check if this time is after another
   */
  isAfter(other: EventTime): boolean {
    return this.utcDate > other.utcDate;
  }

  /**
   * Check if equals another EventTime
   */
  equals(other: EventTime): boolean {
    return this.utcDate.getTime() === other.utcDate.getTime();
  }

  /**
   * Get difference in milliseconds from another EventTime
   */
  diff(other: EventTime): number {
    return this.getTime() - other.getTime();
  }

  /**
   * Add milliseconds
   */
  addMilliseconds(ms: number): EventTime {
    return new EventTime(new Date(this.utcDate.getTime() + ms));
  }

  /**
   * Add minutes
   */
  addMinutes(minutes: number): EventTime {
    return this.addMilliseconds(minutes * 60 * 1000);
  }

  /**
   * Add hours
   */
  addHours(hours: number): EventTime {
    return this.addMilliseconds(hours * 60 * 60 * 1000);
  }

  /**
   * Add days
   */
  addDays(days: number): EventTime {
    return this.addMilliseconds(days * 24 * 60 * 60 * 1000);
  }
}

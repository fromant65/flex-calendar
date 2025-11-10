/**
 * Timestamp Value Object
 * 
 * Represents an exact moment in time.
 * Used for audit fields (createdAt, updatedAt, completedAt).
 */

export class Timestamp {
  private readonly date: Date;

  private constructor(date: Date) {
    this.date = new Date(date); // Clone to ensure immutability
  }

  /**
   * Create timestamp for now
   */
  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  /**
   * Create from Date object
   */
  static fromDate(date: Date): Timestamp {
    return new Timestamp(date);
  }

  /**
   * Create from UTC ISO string
   */
  static fromUTC(isoString: string): Timestamp {
    return new Timestamp(new Date(isoString));
  }

  /**
   * Create from milliseconds since epoch
   */
  static fromMillis(millis: number): Timestamp {
    return new Timestamp(new Date(millis));
  }

  /**
   * Get as Date object
   */
  toDate(): Date {
    return new Date(this.date);
  }

  /**
   * Get as ISO string
   */
  toISOString(): string {
    return this.date.toISOString();
  }

  /**
   * Get milliseconds since epoch
   */
  getTime(): number {
    return this.date.getTime();
  }

  /**
   * Format for display
   */
  format(locale: string = 'es-AR', options?: Intl.DateTimeFormatOptions): string {
    return this.date.toLocaleString(locale, options);
  }

  /**
   * Check if before another timestamp
   */
  isBefore(other: Timestamp): boolean {
    return this.date < other.date;
  }

  /**
   * Check if after another timestamp
   */
  isAfter(other: Timestamp): boolean {
    return this.date > other.date;
  }

  /**
   * Check equality
   */
  equals(other: Timestamp): boolean {
    return this.date.getTime() === other.date.getTime();
  }

  /**
   * Get difference in milliseconds
   */
  diff(other: Timestamp): number {
    return this.getTime() - other.getTime();
  }

  /**
   * Get difference in seconds
   */
  diffSeconds(other: Timestamp): number {
    return Math.floor(this.diff(other) / 1000);
  }

  /**
   * Get difference in minutes
   */
  diffMinutes(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60));
  }

  /**
   * Get difference in hours
   */
  diffHours(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60 * 60));
  }

  /**
   * Get difference in days
   */
  diffDays(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60 * 60 * 24));
  }

  /**
   * Add milliseconds
   */
  addMilliseconds(ms: number): Timestamp {
    return new Timestamp(new Date(this.date.getTime() + ms));
  }

  /**
   * Add seconds
   */
  addSeconds(seconds: number): Timestamp {
    return this.addMilliseconds(seconds * 1000);
  }

  /**
   * Add minutes
   */
  addMinutes(minutes: number): Timestamp {
    return this.addMilliseconds(minutes * 60 * 1000);
  }

  /**
   * Add hours
   */
  addHours(hours: number): Timestamp {
    return this.addMilliseconds(hours * 60 * 60 * 1000);
  }

  /**
   * Add days
   */
  addDays(days: number): Timestamp {
    return this.addMilliseconds(days * 24 * 60 * 60 * 1000);
  }
}

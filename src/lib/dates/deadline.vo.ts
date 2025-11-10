/**
 * Deadline Value Object
 * 
 * Represents a date where only the day matters, not the time.
 * Stored at midnight UTC for consistency.
 */

export class Deadline {
  private readonly utcMidnight: Date;

  private constructor(utcMidnight: Date) {
    this.utcMidnight = new Date(utcMidnight);
  }

  /**
   * Create from a date (extracts year, month, day only)
   */
  static fromDate(date: Date): Deadline {
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    return new Deadline(utcMidnight);
  }

  /**
   * Create from a date using local timezone (for display purposes)
   * 
   * When dates come from DB as UTC but we want to display them as-is in the user's timezone,
   * we need to read the local date components instead of UTC components.
   * 
   * Example: DB has "2024-11-14 00:00:00 UTC"
   * - In UTC-3, JavaScript Date object shows "2024-11-13 21:00:00" (previous day in local time)
   * - fromDate() reads UTC components: year=2024, month=10, day=14 ✓ (correct for calculations)
   * - fromLocalDate() reads local components: year=2024, month=10, day=13 (what user sees)
   * 
   * BUT we want to show 2024-11-14 (the date stored in DB), so we need to:
   * 1. Add timezone offset to the Date to "shift" it back
   * 2. Then read the local components which will now match the DB date
   */
  static fromLocalDate(date: Date): Deadline {
    // Add timezone offset to cancel browser's automatic conversion
    // getTimezoneOffset() returns positive for negative UTC (e.g., 180 for UTC-3)
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const shifted = new Date(date.getTime() + offsetMs);
    
    // Now read LOCAL components from the shifted date
    const year = shifted.getFullYear();
    const month = shifted.getMonth();
    const day = shifted.getDate();
    const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    return new Deadline(utcMidnight);
  }

  /**
   * Create from UTC ISO string (from database)
   */
  static fromUTC(isoString: string): Deadline {
    return Deadline.fromDate(new Date(isoString));
  }

  /**
   * Create from date components
   */
  static fromComponents(year: number, month: number, day: number): Deadline {
    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    return new Deadline(utcMidnight);
  }

  /**
   * Create deadline for today
   */
  static today(): Deadline {
    return Deadline.fromDate(new Date());
  }

  /**
   * Create deadline for tomorrow
   */
  static tomorrow(): Deadline {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return Deadline.fromDate(tomorrow);
  }

  /**
   * Create deadline N days from now
   */
  static daysFromNow(days: number): Deadline {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return Deadline.fromDate(future);
  }

  /**
   * Get as Date at midnight UTC
   */
  toUTC(): Date {
    return new Date(this.utcMidnight);
  }

  /**
   * Get as ISO string for database
   */
  toISOString(): string {
    return this.utcMidnight.toISOString();
  }

  /**
   * Format for display (only date, no time)
   * Uses UTC components to avoid timezone conversion
   */
  format(locale: string = 'es-AR'): string {
    const year = this.utcMidnight.getUTCFullYear();
    const month = this.utcMidnight.getUTCMonth();
    const day = this.utcMidnight.getUTCDate();
    
    // Create a date in local timezone with the same components
    const localDate = new Date(year, month, day);
    
    return localDate.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  /**
   * Format short (dd MMM yyyy)
   */
  formatShort(locale: string = 'es-AR'): string {
    const day = this.utcMidnight.getUTCDate().toString().padStart(2, '0');
    
    // Get month name by creating a local date with UTC components
    const year = this.utcMidnight.getUTCFullYear();
    const month = this.utcMidnight.getUTCMonth();
    const localDate = new Date(year, month, 1);
    const monthName = localDate.toLocaleDateString(locale, { month: 'short' });
    
    return `${day} ${monthName} ${year}`;
  }

  /**
   * Check if this deadline is before another
   */
  isBefore(other: Deadline): boolean {
    return this.utcMidnight < other.utcMidnight;
  }

  /**
   * Check if this deadline is after another
   */
  isAfter(other: Deadline): boolean {
    return this.utcMidnight > other.utcMidnight;
  }

  /**
   * Check if this deadline is today
   */
  isToday(): boolean {
    return this.equals(Deadline.today());
  }

  /**
   * Check if this deadline is in the past
   */
  isPast(): boolean {
    return this.isBefore(Deadline.today());
  }

  /**
   * Check if this deadline is in the future
   */
  isFuture(): boolean {
    return this.isAfter(Deadline.today());
  }

  /**
   * Check equality with another deadline
   */
  equals(other: Deadline): boolean {
    return this.utcMidnight.getTime() === other.utcMidnight.getTime();
  }

  /**
   * Get days until this deadline (negative if past)
   */
  daysUntil(): number {
    const today = Deadline.today();
    const diffMs = this.utcMidnight.getTime() - today.utcMidnight.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Add days to this deadline
   */
  addDays(days: number): Deadline {
    const newDate = new Date(this.utcMidnight);
    newDate.setUTCDate(newDate.getUTCDate() + days);
    return new Deadline(newDate);
  }

  /**
   * Get year, month, day components
   */
  getComponents(): { year: number; month: number; day: number } {
    return {
      year: this.utcMidnight.getUTCFullYear(),
      month: this.utcMidnight.getUTCMonth() + 1,
      day: this.utcMidnight.getUTCDate(),
    };
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  getDayOfWeek(): number {
    return this.utcMidnight.getUTCDay();
  }

  /**
   * Get day of month (1-31)
   */
  getDayOfMonth(): number {
    return this.utcMidnight.getUTCDate();
  }

  /**
   * Get timestamp in milliseconds
   */
  getTime(): number {
    return this.utcMidnight.getTime();
  }

  /**
   * Convert to JavaScript Date object (UTC midnight)
   */
  toDate(): Date {
    return new Date(this.utcMidnight);
  }
}

/**
 * DateFormatter
 * 
 * Utility for consistent date formatting
 */

import { EventTime } from './event-time.vo';
import { Deadline } from './deadline.vo';
import { Timestamp } from './timestamp.vo';
import type { DateFormatStyle } from './types';

export class DateFormatter {
  private static readonly DEFAULT_LOCALE = 'es-AR';

  /**
   * Format EventTime for display
   */
  static formatEventTime(
    time: EventTime,
    format: DateFormatStyle = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const options: Intl.DateTimeFormatOptions = this.getEventTimeOptions(format);
    return time.format(locale, options);
  }

  /**
   * Format Deadline for display
   */
  static formatDeadline(
    deadline: Deadline,
    format: DateFormatStyle = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    if (format === 'short') {
      return deadline.formatShort(locale);
    }
    return deadline.format(locale);
  }

  /**
   * Format Deadline with relative time (e.g., "Mañana", "En 3 días")
   */
  static formatDeadlineRelative(
    deadline: Deadline,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const days = deadline.daysUntil();

    if (days < 0) {
      const absDays = Math.abs(days);
      return `Vencida hace ${absDays} día${absDays !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Mañana';
    } else if (days <= 7) {
      return `En ${days} días`;
    } else {
      return deadline.format(locale);
    }
  }

  /**
   * Format Timestamp
   */
  static formatTimestamp(
    timestamp: Timestamp,
    format: DateFormatStyle = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const options: Intl.DateTimeFormatOptions = this.getTimestampOptions(format);
    return timestamp.format(locale, options);
  }

  /**
   * Format duration in human-readable form
   */
  static formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Format duration in long form (e.g., "2 horas 30 minutos")
   */
  static formatDurationLong(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    
    if (hours > 0) {
      parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    }
    
    if (minutes > 0) {
      parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return 'menos de 1 minuto';
    }

    return parts.join(' ');
  }

  /**
   * Format date range
   */
  static formatDateRange(
    start: Deadline,
    end: Deadline,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const startStr = start.formatShort(locale);
    const endStr = end.formatShort(locale);
    
    // If same date
    if (start.equals(end)) {
      return startStr;
    }
    
    // If same year
    const startComp = start.getComponents();
    const endComp = end.getComponents();
    
    if (startComp.year === endComp.year) {
      // If same month
      if (startComp.month === endComp.month) {
        return `${startComp.day}-${endComp.day} ${startStr.split(' ')[1]} ${startComp.year}`;
      }
    }
    
    return `${startStr} - ${endStr}`;
  }

  /**
   * Format time range (for events)
   */
  static formatTimeRange(
    start: EventTime,
    end: EventTime,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const startStr = start.format(locale, { hour: '2-digit', minute: '2-digit' });
    const endStr = end.format(locale, { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  }

  /**
   * Get EventTime format options
   */
  private static getEventTimeOptions(format: DateFormatStyle): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return {
          dateStyle: 'short',
          timeStyle: 'short',
        };
      case 'medium':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
      case 'long':
        return {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        };
    }
  }

  /**
   * Get Timestamp format options
   */
  private static getTimestampOptions(format: DateFormatStyle): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return {
          dateStyle: 'short',
          timeStyle: 'short',
        };
      case 'medium':
        return {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
      case 'long':
        return {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        };
    }
  }

  /**
   * Format as ISO date string (YYYY-MM-DD)
   */
  static toISODate(deadline: Deadline): string {
    const { year, month, day } = deadline.getComponents();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /**
   * Format as ISO time string (HH:MM:SS)
   */
  static toISOTime(time: EventTime): string {
    const components = time.getComponents();
    return `${components.hour.toString().padStart(2, '0')}:${components.minute.toString().padStart(2, '0')}:${components.second.toString().padStart(2, '0')}`;
  }
}

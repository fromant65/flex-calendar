/**
 * Date Display Utilities
 * 
 * Utilities for displaying dates in the UI with consistent UTC handling.
 * 
 * Uses shared date library (Deadline VO) which handles UTC conversion correctly.
 */

import { Deadline, DateFormatter } from './dates';

/**
 * Get user's locale from browser
 */
function getUserLocale(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'es-AR';
  }
  return 'es-AR';
}

/**
 * Convert a date from DB to a format suitable for HTML date inputs (YYYY-MM-DD)
 * Uses Deadline.fromLocalDate() to handle UTC conversion correctly.
 */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  
  const deadline = Deadline.fromLocalDate(date);
  const { year, month, day } = deadline.getComponents();
  
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Format a date for display (short format with weekday)
 * Format: "dd MMM yyyy · día"
 * Example: "03 nov 2024 · lunes"
 * 
 * Uses Deadline.fromLocalDate() to display dates as stored in DB.
 */
export function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "N/A";
  
  const deadline = Deadline.fromLocalDate(date);
  const locale = getUserLocale();
  return DateFormatter.formatDeadline(deadline, "short", locale);
}

/**
 * Format a date for display (long format with year and weekday)
 * Format: "dd MMM yyyy · día"
 * Example: "03 nov 2024 · lunes"
 * 
 * Uses Deadline.fromLocalDate() to display dates as stored in DB.
 */
export function formatDateLong(date: Date | null | undefined): string {
  if (!date) return "N/A";
  
  const deadline = Deadline.fromLocalDate(date);
  const locale = getUserLocale();
  return DateFormatter.formatDeadline(deadline, "medium", locale);
}

/**
 * Get limit date display with badge and color based on proximity
 */
export function getLimitDateDisplay(limitDate: Date | null) {
  if (!limitDate) {
    return { 
      text: "Sin límite", 
      shortText: "Sin límite",
      color: "text-muted-foreground", 
      badge: null as React.ReactNode,
      badgeText: null as string | null,
    };
  }
  
  // Use Deadline.fromLocalDate() to display date as stored in DB
  const limitDeadline = Deadline.fromLocalDate(limitDate);
  const daysUntilLimit = limitDeadline.daysUntil();
  const locale = getUserLocale();
  
  // Format dates using DateFormatter
  const dateText = DateFormatter.formatDeadline(limitDeadline, "medium", locale);
  const shortText = DateFormatter.formatDeadline(limitDeadline, "short", locale);

  // Determine color and badge based on proximity
  if (daysUntilLimit < 0) {
    return {
      text: dateText,
      shortText,
      color: "text-red-600 dark:text-red-400 font-semibold",
      badge: null, // Badge will be created in component
      badgeText: "Vencida",
    };
  } else if (daysUntilLimit === 0) {
    return {
      text: dateText,
      shortText,
      color: "text-red-600 dark:text-red-400 font-semibold",
      badge: null,
      badgeText: "Hoy",
    };
  } else if (daysUntilLimit === 1) {
    return {
      text: dateText,
      shortText,
      color: "text-orange-600 dark:text-orange-400",
      badge: null,
      badgeText: "Mañana",
    };
  } else if (daysUntilLimit <= 3) {
    return {
      text: dateText,
      shortText,
      color: "text-orange-600 dark:text-orange-400",
      badge: null,
      badgeText: "Próxima",
    };
  } else if (daysUntilLimit <= 7) {
    return {
      text: dateText,
      shortText,
      color: "text-yellow-600 dark:text-yellow-400",
      badge: null,
      badgeText: null,
    };
  } else {
    return {
      text: dateText,
      shortText,
      color: "text-green-600 dark:text-green-400",
      badge: null,
      badgeText: null,
    };
  }
}

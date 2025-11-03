/**
 * Date Display Utilities
 * 
 * Utilities for displaying dates in the UI, including timezone normalization
 * and limit date formatting with visual indicators.
 */

/**
 * Normalize a date from DB (stored as UTC) to display as-is without timezone conversion
 * 
 * DB stores dates at midnight UTC (00:00). In negative timezones (e.g., UTC-3),
 * the browser converts this to the previous day at 21:00.
 * 
 * To display the date as stored in DB, we ADD the timezone offset.
 * 
 * Example: DB has "2024-10-31 00:00:00 UTC"
 * - In UTC-3, Date object shows "2024-10-30 21:00:00"
 * - We add 3 hours to get back to "2024-10-31 00:00:00"
 */
export function normalizeDateForDisplay(date: Date | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  // getTimezoneOffset() returns minutes (negative for positive UTC, positive for negative UTC)
  // For UTC-3, it returns 180 (minutes)
  // We need to ADD this to get back to UTC
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() + offsetMs);
}

/**
 * Format a date for display (short format with weekday)
 * Format: "dd MMM yyyy · día"
 * Example: "03 nov 2024 · lunes"
 */
export function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "N/A";
  const normalized = normalizeDateForDisplay(date);
  if (!normalized) return "N/A";
  
  const day = normalized.getDate().toString().padStart(2, '0');
  const monthName = normalized.toLocaleDateString("es-AR", { month: "short" });
  const year = normalized.getFullYear();
  const weekday = normalized.toLocaleDateString("es-AR", { weekday: "long" });
  
  return `${day} ${monthName} ${year} · ${weekday}`;
}

/**
 * Format a date for display (long format with year and weekday)
 * Format: "dd MMM yyyy · día"
 * Example: "03 nov 2024 · lunes"
 */
export function formatDateLong(date: Date | null | undefined): string {
  if (!date) return "N/A";
  const normalized = normalizeDateForDisplay(date);
  if (!normalized) return "N/A";
  
  const day = normalized.getDate().toString().padStart(2, '0');
  const monthName = normalized.toLocaleDateString("es-AR", { month: "short" });
  const year = normalized.getFullYear();
  const weekday = normalized.toLocaleDateString("es-AR", { weekday: "long" });
  
  return `${day} ${monthName} ${year} · ${weekday}`;
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

  // Normalize both dates for comparison
  const now = normalizeDateForDisplay(new Date());
  const limit = normalizeDateForDisplay(limitDate);
  
  if (!now || !limit) {
    return { 
      text: "Error", 
      shortText: "Error",
      color: "text-muted-foreground", 
      badge: null as React.ReactNode,
      badgeText: null as string | null,
    };
  }
  
  const daysUntilLimit = Math.floor((limit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const dateText = formatDateLong(limitDate);
  const shortText = formatDateShort(limitDate);

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

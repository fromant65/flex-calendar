/**
 * Date Utilities for Backend
 * 
 * These utilities ensure that dates are properly handled when coming from the database
 * and being sent to the client through tRPC.
 * 
 * Problem: In production (Vercel + Neon), Drizzle sometimes returns dates as strings
 * instead of Date objects. The strings may or may not include timezone information.
 * We need to normalize them to always include UTC timezone marker (Z) so that
 * Date parsing is consistent.
 */

/**
 * Normalizes a date string to ensure it has UTC timezone marker
 * Patterns handled:
 * - "2025-10-29 11:51:19.264+00" -> "2025-10-29T11:51:19.264+00" (Postgres format - add T)
 * - "2025-11-14 16:30:00" -> "2025-11-14T16:30:00Z" (add T and Z)
 * - "2025-11-14T16:30:00" -> "2025-11-14T16:30:00Z" (add Z)
 * - "2025-11-14T16:30:00.000" -> "2025-11-14T16:30:00.000Z" (add Z)
 * - "2025-11-14T16:30:00Z" -> "2025-11-14T16:30:00Z" (keep as is)
 * - "2025-11-14T16:30:00+00:00" -> "2025-11-14T16:30:00+00:00" (keep as is)
 */
function normalizeUTCString(dateString: string): string {
  // Pattern 1: YYYY-MM-DD HH:MM:SS.mmm+00 (Postgres/Neon format with space separator)
  // This is the most common format from production: "2025-10-29 11:51:19.264+00"
  const postgresFormat = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)((?:[+-]\d{2}(?::\d{2})?)?)$/;
  const postgresMatch = dateString.match(postgresFormat);
  if (postgresMatch) {
    const datePart = postgresMatch[1];
    const timePart = postgresMatch[2];
    const tzPart = postgresMatch[3];
    
    // If it has timezone info (+00, +00:00, etc), keep it
    if (tzPart) {
      return `${datePart}T${timePart}${tzPart}`;
    }
    // Otherwise add Z
    return `${datePart}T${timePart}Z`;
  }
  
  // Pattern 2: Already has T separator, check timezone
  if (dateString.includes('T')) {
    // If it already ends with Z, keep it
    if (dateString.endsWith('Z')) {
      return dateString;
    }
    // If it has timezone offset like +00, +00:00, -03:00, keep it
    if (/[+-]\d{2}(?::\d{2})?$/.test(dateString)) {
      return dateString;
    }
    // Otherwise add Z
    return `${dateString}Z`;
  }
  
  // Fallback: return as is (should not happen with valid dates)
  return dateString;
}

/**
 * Ensures a value from the database is a proper Date object with normalized UTC string
 * If it's already a Date, returns it. If it's a string, normalizes it first then converts.
 * If it's null or undefined, returns it as-is.
 */
export function ensureDate(value: Date | string | number | null | undefined): Date | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  // If it's a string, normalize it first
  let normalizedValue = value;
  if (typeof value === 'string') {
    normalizedValue = normalizeUTCString(value);
  }
  
  // Convert to Date
  const date = new Date(normalizedValue);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    console.error('Invalid date value from database:', value, 'normalized to:', normalizedValue);
    return null;
  }
  
  return date;
}

/**
 * Normalizes all date fields in an object to ensure they are Date objects
 * This is crucial for SuperJSON to properly serialize them for tRPC
 */
export function normalizeDates<T extends Record<string, any>>(obj: T, dateFields: (keyof T)[]): T {
  const normalized = { ...obj };
  
  for (const field of dateFields) {
    if (field in normalized) {
      // Type assertion needed: we're dynamically accessing and transforming fields
      // The field value could be Date | string | null, and we're ensuring it becomes Date | null
      normalized[field] = ensureDate(normalized[field] as any) as any;
    }
  }
  
  return normalized;
}

/**
 * Normalizes dates in an array of objects
 */
export function normalizeDatesArray<T extends Record<string, any>>(
  array: T[],
  dateFields: (keyof T)[]
): T[] {
  return array.map(obj => normalizeDates(obj, dateFields));
}

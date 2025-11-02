/**
 * Date Utilities for Backend
 * 
 * These utilities ensure that dates are properly handled when coming from the database
 * and being sent to the client through tRPC.
 * 
 * Problem: In production (Vercel + Neon), Drizzle sometimes returns dates as strings
 * instead of Date objects. SuperJSON only transforms actual Date objects, so strings
 * are sent as-is to the client, causing timezone issues.
 */

/**
 * Ensures a value from the database is a proper Date object
 * If it's already a Date, returns it. If it's a string or number, converts it to Date.
 * If it's null or undefined, returns it as-is.
 */
export function ensureDate(value: Date | string | number | null | undefined): Date | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  // Convert string or number to Date
  const date = new Date(value);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    console.error('Invalid date value from database:', value);
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

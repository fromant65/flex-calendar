/**
 * Recurrence Utilities
 * 
 * Helper functions for parsing and validating recurrence patterns
 */

export interface DaysOfMonthValidation {
  isValid: boolean
  errorMessage: string | null
  parsedDays: number[]
}

/**
 * Validate and parse a comma-separated string of day numbers
 * 
 * @param input - String containing day numbers separated by commas (e.g., "1, 15, 30")
 * @returns Validation result with error message and parsed days
 * 
 * @example
 * validateAndParseDaysOfMonth("1, 15, 30") 
 * // { isValid: true, errorMessage: null, parsedDays: [1, 15, 30] }
 * 
 * validateAndParseDaysOfMonth("abc, xyz") 
 * // { isValid: false, errorMessage: "No se encontraron números válidos", parsedDays: [] }
 * 
 * validateAndParseDaysOfMonth("1, 15, 50") 
 * // { isValid: false, errorMessage: "Los días deben estar entre 1 y 31", parsedDays: [] }
 */
export function validateAndParseDaysOfMonth(input: string): DaysOfMonthValidation {
  // Empty input
  if (!input || input.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Debes ingresar al menos un día",
      parsedDays: []
    }
  }

  // Split by comma and trim
  const parts = input.split(",").map(part => part.trim()).filter(part => part !== "")
  
  if (parts.length === 0) {
    return {
      isValid: false,
      errorMessage: "Debes ingresar al menos un día",
      parsedDays: []
    }
  }

  // Check if all parts are numbers
  const invalidParts: string[] = []
  const numbers: number[] = []
  const outOfRangeParts: string[] = []

  for (const part of parts) {
    const num = Number.parseInt(part)
    if (isNaN(num)) {
      invalidParts.push(part)
    } else if (num < 1 || num > 31) {
      outOfRangeParts.push(part)
    } else {
      numbers.push(num)
    }
  }

  // Report errors
  if (invalidParts.length > 0) {
    return {
      isValid: false,
      errorMessage: `Valores inválidos: ${invalidParts.join(", ")}. Solo se permiten números.`,
      parsedDays: []
    }
  }

  if (outOfRangeParts.length > 0) {
    return {
      isValid: false,
      errorMessage: `Valores fuera de rango: ${outOfRangeParts.join(", ")}. Los días deben estar entre 1 y 31.`,
      parsedDays: []
    }
  }

  if (numbers.length === 0) {
    return {
      isValid: false,
      errorMessage: "Debes ingresar al menos un día",
      parsedDays: []
    }
  }

  // Remove duplicates and sort
  const uniqueSortedDays = Array.from(new Set(numbers)).sort((a, b) => a - b)

  return {
    isValid: true,
    errorMessage: null,
    parsedDays: uniqueSortedDays
  }
}

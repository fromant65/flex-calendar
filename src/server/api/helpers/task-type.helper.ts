/**
 * Task Type Helper - Centralized business logic for calculating task types
 */

import type { TaskRecurrence, TaskType } from "../services/types";

/**
 * Calculate task type based on recurrence pattern
 * 
 * Business rules:
 * - Única: No recurrence or maxOccurrences = 1
 * - Recurrente Finita: maxOccurrences > 1 without interval OR with interval and maxOccurrences > 1
 * - Hábito: Has interval, no specific days, infinite or single occurrence
 * - Hábito +: Has interval with specific days (daysOfWeek or daysOfMonth)
 */
export function calculateTaskType(recurrence: TaskRecurrence | null | undefined): TaskType {
  // No recurrence = single task
  if (!recurrence) return "Única";
  
  // Explicit single occurrence
  if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
    return "Única";
  }
  
  // Multiple occurrences without interval
  if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
    return "Recurrente Finita";
  }
  
  // Has interval (recurring pattern)
  if (recurrence.interval) {
    // Check if it has specific scheduling constraints
    const hasSpecificDays = !!(recurrence.daysOfWeek?.length || recurrence.daysOfMonth?.length);
    const hasMoreThanOneOccurrence = !!(recurrence.maxOccurrences && recurrence.maxOccurrences > 1);
    if (hasSpecificDays || hasMoreThanOneOccurrence) {
      return "Hábito +";
    }
    
    // Simple interval-based habit
    return "Hábito";
  }
  
  // Fallback for edge cases
  return "Única";
}

/**
 * Task Type Helper - Centralized business logic for calculating task types
 */

import type { TaskRecurrence, TaskType, Task } from "../services/types";

/**
 * Calculate task type based on recurrence pattern and fixed status
 * 
 * Business rules:
 * - Fija Única: isFixed=true with maxOccurrences=1
 * - Fija Repetitiva: isFixed=true with recurring pattern
 * - Única: No recurrence or maxOccurrences = 1
 * - Recurrente Finita: maxOccurrences > 1 without interval OR with interval and maxOccurrences > 1
 * - Hábito: Has interval, no specific days, infinite or single occurrence
 * - Hábito +: Has interval with specific days (daysOfWeek or daysOfMonth)
 */
export function calculateTaskType(
  recurrence: TaskRecurrence | null | undefined,
  task?: { isFixed?: boolean } | null
): TaskType {
  // Check if task is fixed first
  if (task?.isFixed) {
    // Fixed tasks with single occurrence
    if (!recurrence || recurrence.maxOccurrences === 1) {
      return "Fija Única";
    }
    // Fixed tasks with recurring pattern
    return "Fija Repetitiva";
  }

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

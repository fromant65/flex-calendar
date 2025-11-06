/**
 * Strategy Types and Contexts
 * 
 * Defines the context objects passed to strategy methods.
 * These provide all necessary information for strategies to make decisions.
 */

import type { 
  Task, 
  TaskRecurrence, 
  TaskOccurrence, 
  CalendarEvent 
} from '../../types';
import type { TaskSchedulerServiceInterface } from '../../scheduling';

/**
 * Dependencies injected into strategies
 * Allows strategies to interact with other services without tight coupling
 */
export interface StrategyDependencies {
  scheduler: TaskSchedulerServiceInterface;
  // Add more dependencies as needed during refactoring
}

/**
 * Context for occurrence-related operations
 */
export interface OccurrenceContext {
  occurrence: TaskOccurrence;
  task: Task;
  recurrence: TaskRecurrence | null;
  allOccurrences?: TaskOccurrence[]; // For checking completion status
}

/**
 * Context for event-related operations
 */
export interface EventContext {
  event: CalendarEvent;
  occurrence: TaskOccurrence | null;
  task: Task | null;
  recurrence: TaskRecurrence | null;
}

/**
 * Context for general task operations
 */
export interface TaskContext {
  task: Task;
  recurrence: TaskRecurrence | null;
  lastOccurrence?: TaskOccurrence | null;
  allOccurrences?: TaskOccurrence[];
}

/**
 * Context for task completion decisions
 */
export interface TaskCompletionContext {
  task: Task;
  recurrence: TaskRecurrence | null;
  allOccurrences: TaskOccurrence[];
  completedCount: number;
  skippedCount: number;
  pendingCount: number;
}

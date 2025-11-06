/**
 * Task Strategy Interface
 * 
 * Defines the contract that all task type strategies must implement.
 * Each strategy encapsulates the behavior for a specific task type.
 */

import type { TaskType } from '../../types';
import type {
  OccurrenceContext,
  EventContext,
  TaskContext,
  TaskCompletionContext,
} from './strategy-types';

/**
 * Actions that can be returned by strategy methods
 * These represent the next step in the task lifecycle
 */
export type TaskLifecycleAction =
  | { type: 'CREATE_NEXT_OCCURRENCE'; params?: CreateOccurrenceParams }
  | { type: 'COMPLETE_TASK' }
  | { type: 'DEACTIVATE_TASK' }
  | { type: 'NO_ACTION' };

/**
 * Parameters for creating next occurrence
 */
export interface CreateOccurrenceParams {
  taskId?: number;
  targetTimeConsumption?: number;
}

/**
 * Core strategy interface
 * All task type strategies must implement these methods
 */
export interface ITaskStrategy {
  /**
   * Identifier for this strategy's task type
   */
  readonly taskType: TaskType;

  // ==================== OCCURRENCE LIFECYCLE ====================

  /**
   * Called when an occurrence is completed
   * Returns the next action to take in the task lifecycle
   */
  onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction>;

  /**
   * Called when an occurrence is skipped
   * Returns the next action to take in the task lifecycle
   */
  onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction>;

  // ==================== EVENT LIFECYCLE ====================

  /**
   * Called when a calendar event is completed
   * Returns the next action to take in the task lifecycle
   */
  onEventCompleted(context: EventContext): Promise<TaskLifecycleAction>;

  /**
   * Called when a calendar event is skipped
   * Returns the next action to take in the task lifecycle
   */
  onEventSkipped(context: EventContext): Promise<TaskLifecycleAction>;

  // ==================== OCCURRENCE GENERATION ====================

  /**
   * Determines if a new occurrence should be created for this task
   * Used by scheduler to decide when to generate next occurrence
   */
  shouldCreateNextOccurrence(context: TaskContext): boolean;

  /**
   * Determines if this task type should generate backlog occurrences
   * Used by backlog detection service
   */
  shouldGenerateBacklogOccurrences(): boolean;

  // ==================== TASK COMPLETION ====================

  /**
   * Determines if the task should be marked as completed
   * Returns true if all work is done and task can be archived
   */
  shouldCompleteTask(context: TaskCompletionContext): boolean;

  /**
   * Determines if the task should be deactivated (soft deleted)
   * Returns true if task should no longer appear in active lists
   */
  shouldDeactivateTask(context: TaskCompletionContext): boolean;
}

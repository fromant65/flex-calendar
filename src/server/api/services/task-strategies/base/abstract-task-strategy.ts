/**
 * Abstract Task Strategy
 * 
 * Base class providing common functionality for all task strategies.
 * Concrete strategies extend this and override specific methods as needed.
 */

import type { ITaskStrategy, TaskLifecycleAction } from './task-strategy.interface';
import type {
  OccurrenceContext,
  EventContext,
  TaskContext,
  TaskCompletionContext,
  StrategyDependencies,
} from './strategy-types';
import type { TaskType } from '../../types';

export abstract class AbstractTaskStrategy implements ITaskStrategy {
  abstract readonly taskType: TaskType;

  constructor(protected deps: StrategyDependencies) {}

  // ==================== ABSTRACT METHODS (must be implemented) ====================

  abstract onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction>;
  abstract onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction>;

  // ==================== DEFAULT IMPLEMENTATIONS ====================

  /**
   * Default: Fixed tasks have their own event handling logic
   * Non-fixed tasks delegate to occurrence completion
   */
  async onEventCompleted(context: EventContext): Promise<TaskLifecycleAction> {
    // For non-fixed tasks, event completion doesn't automatically complete occurrence
    // User must explicitly complete the occurrence
    return { type: 'NO_ACTION' };
  }

  /**
   * Default: Event skipping doesn't affect task lifecycle for most types
   */
  async onEventSkipped(context: EventContext): Promise<TaskLifecycleAction> {
    return { type: 'NO_ACTION' };
  }

  /**
   * Default: Create next occurrence if last one is completed or skipped
   */
  shouldCreateNextOccurrence(context: TaskContext): boolean {
    if (!context.lastOccurrence) return true; // No occurrence exists yet

    const lastStatus = context.lastOccurrence.status;
    return lastStatus === 'Completed' || lastStatus === 'Skipped';
  }

  /**
   * Default: Most tasks don't generate backlog occurrences
   * Only habits do
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return false;
  }

  /**
   * Default: Task is completed when explicitly marked
   */
  shouldCompleteTask(context: TaskCompletionContext): boolean {
    return false;
  }

  /**
   * Default: Task is deactivated when explicitly marked
   */
  shouldDeactivateTask(context: TaskCompletionContext): boolean {
    return false;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Helper: Increment completed occurrences counter for period-based habits
   */
  protected async incrementCompletedOccurrences(
    recurrenceId: number,
    occurrenceStartDate: Date
  ): Promise<void> {
    await this.deps.scheduler.incrementCompletedOccurrences(recurrenceId, occurrenceStartDate);
  }

  /**
   * Helper: Count occurrences by status
   */
  protected countOccurrencesByStatus(occurrences: Array<{ status: string }>) {
    const completed = occurrences.filter((o) => o.status === 'Completed').length;
    const skipped = occurrences.filter((o) => o.status === 'Skipped').length;
    const pending = occurrences.filter(
      (o) => o.status === 'Pending' || o.status === 'InProgress'
    ).length;

    return { completed, skipped, pending, discarded: completed + skipped };
  }

  /**
   * Helper: Check if all occurrences are completed or skipped
   */
  protected areAllOccurrencesFinished(occurrences: Array<{ status: string }>): boolean {
    if (occurrences.length === 0) return false;

    return occurrences.every(
      (o) => o.status === 'Completed' || o.status === 'Skipped'
    );
  }
}

/**
 * Finite Recurring Strategy (Recurrente Finita)
 * 
 * Handles tasks with a fixed number of occurrences but no interval pattern.
 * 
 * Business Rules:
 * - Has maxOccurrences > 1 and no interval
 * - Creates next occurrence until maxOccurrences is reached
 * - Counts both completed and skipped as "discarded"
 * - Task completes when all N occurrences are discarded
 * 
 * Extracted from: occurrence-completion.service.ts lines 72-83
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext } from '../base/strategy-types';
import type { TaskType } from '../../types';

export class FiniteRecurringStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = 'Recurrente Finita';

  /**
   * When occurrence is completed, create next if under maxOccurrences
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence || !context.allOccurrences) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter for the period
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    // Count discarded occurrences (completed + skipped)
    const { discarded } = this.countOccurrencesByStatus(context.allOccurrences);
    const maxOccurrences = context.recurrence.maxOccurrences ?? 0;

    if (discarded < maxOccurrences) {
      // Create next occurrence
      return {
        type: 'CREATE_NEXT_OCCURRENCE',
        params: {
          taskId: context.task.id,
          targetTimeConsumption: context.occurrence.targetTimeConsumption ?? undefined,
        },
      };
    } else {
      // All occurrences done, complete task
      return { type: 'COMPLETE_TASK' };
    }
  }

  /**
   * When occurrence is skipped, same logic as completed
   */
  async onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence || !context.allOccurrences) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter (skipped counts)
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    const { discarded } = this.countOccurrencesByStatus(context.allOccurrences);
    const maxOccurrences = context.recurrence.maxOccurrences ?? 0;

    if (discarded < maxOccurrences) {
      return {
        type: 'CREATE_NEXT_OCCURRENCE',
        params: { taskId: context.task.id },
      };
    } else {
      return { type: 'COMPLETE_TASK' };
    }
  }

  /**
   * Finite recurring tasks don't generate backlog
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return false;
  }
}

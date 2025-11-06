/**
 * Habit Plus Strategy (Hábito +)
 * 
 * Handles advanced habit tasks with interval and specific days pattern.
 * 
 * Business Rules:
 * - Has interval with daysOfWeek or daysOfMonth
 * - Period-based: maxOccurrences per period (week/month)
 * - Creates next occurrence infinitely
 * - Resets counter at period boundaries
 * - Generates backlog occurrences when behind
 * 
 * Similar to Habit but with period management.
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext } from '../base/strategy-types';
import type { TaskType } from '../../types';

export class HabitPlusStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = 'Hábito +';

  /**
   * When occurrence is completed, always create next
   * Habit+ continues indefinitely with period management
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter for the period
    // The scheduler handles period transitions
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    return {
      type: 'CREATE_NEXT_OCCURRENCE',
      params: { taskId: context.task.id },
    };
  }

  /**
   * When occurrence is skipped, still create next
   */
  async onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter (skipped counts)
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    return {
      type: 'CREATE_NEXT_OCCURRENCE',
      params: { taskId: context.task.id },
    };
  }

  /**
   * Habit+ generates backlog occurrences
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return true;
  }

  /**
   * Habit+ never completes automatically
   */
  shouldCompleteTask(): boolean {
    return false;
  }
}

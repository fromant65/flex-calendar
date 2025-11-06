/**
 * Habit Strategy (Hábito)
 * 
 * Handles simple habit tasks with interval-based recurrence.
 * 
 * Business Rules:
 * - Has interval, no specific days (daysOfWeek/daysOfMonth)
 * - Creates next occurrence infinitely
 * - Never completes automatically
 * - Generates backlog occurrences when behind
 * 
 * Extracted from: occurrence-completion.service.ts lines 85-88
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext } from '../base/strategy-types';
import { TaskType } from '../../types';

export class HabitStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = TaskType.HABIT;

  /**
   * When occurrence is completed, always create next
   * Habits continue indefinitely
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter for the period
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
   * Habits generate backlog occurrences
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return true;
  }

  /**
   * Habits never complete automatically
   */
  shouldCompleteTask(): boolean {
    return false;
  }
}

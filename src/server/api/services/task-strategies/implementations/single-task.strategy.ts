/**
 * Single Task Strategy (Tarea Única)
 * 
 * Handles tasks with single occurrence and no recurrence pattern.
 * 
 * Business Rules:
 * - Has maxOccurrences = 1 and no interval
 * - Task completes when the single occurrence is completed or skipped
 * - No next occurrences are generated
 * 
 * Extracted from: occurrence-completion.service.ts lines 66-69
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext } from '../base/strategy-types';
import type { TaskType } from '../../types';

export class SingleTaskStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = 'Única';

  /**
   * When occurrence is completed, complete the entire task
   * Single tasks have only one occurrence
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    return { type: 'COMPLETE_TASK' };
  }

  /**
   * When occurrence is skipped, still complete the task
   * There's no next occurrence to create
   */
  async onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    return { type: 'COMPLETE_TASK' };
  }

  /**
   * Single tasks never create next occurrence
   */
  shouldCreateNextOccurrence(): boolean {
    return false;
  }

  /**
   * Single tasks don't generate backlog
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return false;
  }
}

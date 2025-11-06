/**
 * Fixed Single Strategy (Fija Única)
 * 
 * Handles fixed-time tasks with single occurrence.
 * 
 * Business Rules:
 * - isFixed = true with maxOccurrences = 1
 * - Pre-generates occurrence and event at creation
 * - Deactivates (soft deletes) when occurrence completed/skipped
 * - Event completion automatically completes occurrence
 * 
 * Extracted from: event-completion.service.ts lines 131-134
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext, EventContext } from '../base/strategy-types';
import { TaskType } from '../../types';

export class FixedSingleStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = TaskType.FIXED_SINGLE;

  /**
   * When occurrence is completed, deactivate task
   * Fixed single tasks end after the one occurrence
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence) {
      return { type: 'DEACTIVATE_TASK' };
    }

    // Increment completed occurrences counter
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    return { type: 'DEACTIVATE_TASK' };
  }

  /**
   * When occurrence is skipped, also deactivate task
   */
  async onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence) {
      return { type: 'DEACTIVATE_TASK' };
    }

    // Increment completed occurrences counter (skipped counts)
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    return { type: 'DEACTIVATE_TASK' };
  }

  /**
   * Fixed tasks: event completion triggers occurrence completion
   */
  async onEventCompleted(context: EventContext): Promise<TaskLifecycleAction> {
    // Fixed tasks always complete occurrence when event is completed
    if (!context.occurrence) {
      return { type: 'NO_ACTION' };
    }

    // The event completion service will handle completing the occurrence
    // Then it will call onOccurrenceCompleted which will deactivate the task
    return { type: 'NO_ACTION' };
  }

  /**
   * Fixed tasks: event skipping triggers occurrence skipping
   */
  async onEventSkipped(context: EventContext): Promise<TaskLifecycleAction> {
    if (!context.occurrence) {
      return { type: 'NO_ACTION' };
    }

    // The event completion service will handle skipping the occurrence
    // Then it will call onOccurrenceSkipped which will deactivate the task
    return { type: 'NO_ACTION' };
  }

  /**
   * Fixed single tasks don't create next occurrence
   * Occurrence is pre-generated at task creation
   */
  shouldCreateNextOccurrence(): boolean {
    return false;
  }

  /**
   * Fixed tasks don't generate backlog
   */
  shouldGenerateBacklogOccurrences(): boolean {
    return false;
  }
}

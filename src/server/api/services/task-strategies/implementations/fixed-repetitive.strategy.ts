/**
 * Fixed Repetitive Strategy (Fija Repetitiva)
 * 
 * Handles fixed-time tasks with multiple pre-generated occurrences.
 * 
 * Business Rules:
 * - isFixed = true with maxOccurrences > 1 or recurring pattern
 * - Pre-generates all occurrences and events at creation
 * - Deactivates when ALL occurrences are completed/skipped
 * - Event completion automatically completes occurrence
 * 
 * Extracted from: event-completion.service.ts lines 135-139
 */

import { AbstractTaskStrategy } from '../base/abstract-task-strategy';
import type { TaskLifecycleAction } from '../base/task-strategy.interface';
import type { OccurrenceContext, EventContext } from '../base/strategy-types';
import type { TaskType } from '../../types';

export class FixedRepetitiveStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = 'Fija Repetitiva';

  /**
   * When occurrence is completed, check if all are done
   */
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    if (!context.recurrence || !context.allOccurrences) {
      return { type: 'NO_ACTION' };
    }

    // Increment completed occurrences counter
    await this.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );

    // Check if all occurrences are finished
    if (this.areAllOccurrencesFinished(context.allOccurrences)) {
      return { type: 'DEACTIVATE_TASK' };
    }

    return { type: 'NO_ACTION' };
  }

  /**
   * When occurrence is skipped, check if all are done
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

    // Check if all occurrences are finished
    if (this.areAllOccurrencesFinished(context.allOccurrences)) {
      return { type: 'DEACTIVATE_TASK' };
    }

    return { type: 'NO_ACTION' };
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
    // Then it will call onOccurrenceCompleted which checks if all are done
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
    // Then it will call onOccurrenceSkipped which checks if all are done
    return { type: 'NO_ACTION' };
  }

  /**
   * Fixed repetitive tasks don't create next occurrence
   * All occurrences are pre-generated at task creation
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

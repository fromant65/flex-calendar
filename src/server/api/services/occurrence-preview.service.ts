/**
 * Occurrence Preview Service
 * 
 * Handles preview calculations for when the next occurrence would be generated.
 * Used for UI display purposes - does not create actual occurrences.
 */

import type { TaskAdapter, OccurrenceAdapter } from "../adapter";
import type { RecurrenceDateCalculator } from "./recurrence-date-calculator.service";
import type { PeriodManager } from "./period-manager.service";
import type { TaskRecurrence } from "./types";

export class OccurrencePreviewService {
  constructor(
    private taskAdapter: TaskAdapter,
    private occurrenceAdapter: OccurrenceAdapter,
    private dateCalculator: RecurrenceDateCalculator,
    private periodManager: PeriodManager
  ) {}

  /**
   * Preview when the next occurrence would be generated if the current one is completed
   * This is for UI preview purposes only, does not create the occurrence
   */
  async previewNextOccurrenceDate(taskId: number): Promise<Date | null> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task || !task.recurrence) {
      return null;
    }

    const recurrence = task.recurrence;
    const latestOccurrence = await this.occurrenceAdapter.getLatestOccurrenceByTaskId(taskId);

    // Unique task: no next occurrence
    if (this.isUniqueTask(recurrence)) {
      return null;
    }

    // Finite recurrent: check if limit reached
    if (this.isFiniteRecurrent(recurrence)) {
      return await this.previewFiniteRecurrent(taskId, recurrence);
    }

    // Habit or Habit+: calculate based on pattern
    if (recurrence.interval || recurrence.daysOfWeek || recurrence.daysOfMonth) {
      return this.previewRecurringTask(latestOccurrence, recurrence);
    }

    return null;
  }

  /**
   * Check if task is unique (single occurrence)
   */
  private isUniqueTask(recurrence: TaskRecurrence): boolean {
    return recurrence.maxOccurrences === 1 && !recurrence.interval;
  }

  /**
   * Check if task is finite recurrent (multiple occurrences, no interval)
   */
  private isFiniteRecurrent(recurrence: TaskRecurrence): boolean {
    return !!(recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval);
  }

  /**
   * Preview for finite recurrent tasks
   */
  private async previewFiniteRecurrent(
    taskId: number,
    recurrence: TaskRecurrence
  ): Promise<Date | null> {
    const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const completedCount = occurrences.filter(o => o.status === "Completed").length;
    
    if (completedCount >= recurrence.maxOccurrences! - 1) {
      return null; // This is the last occurrence
    }
    
    return new Date(); // Next would be created immediately
  }

  /**
   * Preview for recurring tasks (habits/habits+)
   */
  private previewRecurringTask(
    latestOccurrence: any,
    recurrence: TaskRecurrence
  ): Date | null {
    if (!latestOccurrence) {
      return new Date(); // First occurrence
    }

    const currentDate = new Date();

    // Check if we need to wait for a new period
    if (this.periodManager.shouldStartNewPeriod(recurrence, currentDate)) {
      return this.periodManager.getNextPeriodStartByType(
        recurrence.lastPeriodStart ?? currentDate,
        recurrence
      );
    }

    // Check if we've reached period limit
    if (this.periodManager.hasReachedPeriodLimit(recurrence)) {
      return this.periodManager.getNextPeriodStartByType(
        recurrence.lastPeriodStart ?? currentDate,
        recurrence
      );
    }

    // Calculate next occurrence date based on pattern
    return this.dateCalculator.calculateNextOccurrenceDate(
      latestOccurrence.startDate,
      recurrence
    );
  }
}

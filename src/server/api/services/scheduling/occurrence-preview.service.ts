/**
 * Occurrence Preview Service
 * 
 * Handles preview calculations for when the next occurrence would be generated.
 * Used for UI display purposes - does not create actual occurrences.
 */

import type { TaskAdapter, OccurrenceAdapter } from "../../adapter";
import type { RecurrenceDateCalculator } from "./recurrence-date-calculator.service";
import type { PeriodManager } from "./period-manager.service";
import type { TaskRecurrence, TaskOccurrence } from "../types";
import { TaskStrategyFactory } from "../task-strategies";

export class OccurrencePreviewService {
  constructor(
    private taskAdapter: TaskAdapter,
    private occurrenceAdapter: OccurrenceAdapter,
    private dateCalculator: RecurrenceDateCalculator,
    private periodManager: PeriodManager,
    private strategyFactory: TaskStrategyFactory
  ) {}

  /**
   * Preview when the next occurrence would be generated if the current one is completed
   * This is for UI preview purposes only, does not create the occurrence
   */
  async previewNextOccurrenceDate(taskId: number): Promise<Date | null> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task?.recurrence) {
      return null;
    }

    const recurrence = task.recurrence;
    const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const latestOccurrence = await this.occurrenceAdapter.getLatestOccurrenceByTaskId(taskId);

    // Use strategy to determine if next occurrence should be created
    const strategy = this.strategyFactory.getStrategy(task, recurrence);
    const shouldCreateNext = strategy.shouldCreateNextOccurrence({
      task,
      recurrence,
      allOccurrences: allOccurrences as TaskOccurrence[],
      lastOccurrence: latestOccurrence as TaskOccurrence | undefined,
    });

    // If strategy says no next occurrence, return null
    if (!shouldCreateNext) {
      return null;
    }

    // Habit or Habit+: calculate based on pattern
    if (recurrence.interval || recurrence.daysOfWeek || recurrence.daysOfMonth) {
      return this.previewRecurringTask(latestOccurrence, recurrence);
    }

    // For other types (finite recurring): immediate creation
    return new Date();
  }

  /**
   * Preview for recurring tasks (habits/habits+)
   */
  private previewRecurringTask(
    latestOccurrence: Awaited<ReturnType<OccurrenceAdapter['getLatestOccurrenceByTaskId']>>,
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

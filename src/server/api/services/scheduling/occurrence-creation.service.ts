/**
 * Occurrence Creation Service
 * 
 * Handles the complex logic of creating next occurrences for recurring tasks.
 * Extracted from TaskSchedulerService to reduce file size and improve maintainability.
 */

import type { TaskAdapter, OccurrenceAdapter, RecurrenceAdapter } from "../../adapter";
import type { CreateOccurrenceDTO, DayOfWeek, TaskRecurrence } from "../types";
import type { RecurrenceDateCalculator } from "./recurrence-date-calculator.service";
import type { PeriodManager } from "./period-manager.service";

export class OccurrenceCreationService {
  constructor(
    private taskAdapter: TaskAdapter,
    private occurrenceAdapter: OccurrenceAdapter,
    private recurrenceAdapter: RecurrenceAdapter,
    private dateCalculator: RecurrenceDateCalculator,
    private periodManager: PeriodManager
  ) {}

  /**
   * Create the next occurrence for a recurring task
   */
  async createNextOccurrence(
    taskId: number,
    initialDates?: {
      targetDate?: Date;
      limitDate?: Date;
      targetTimeConsumption?: number;
    }
  ): Promise<void> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task?.recurrence) {
      throw new Error("Task does not have recurrence configured");
    }

    // Refresh recurrence data after potential period update
    const updatedRecurrence = await this.recurrenceAdapter.getRecurrenceById(task.recurrence.id);
    if (!updatedRecurrence) return;

    // Handle unique tasks (single occurrence, no pattern)
    if (this.isUniqueTask(updatedRecurrence)) {
      await this.createUniqueOccurrence(taskId, initialDates);
      return;
    }

    // Get the latest occurrence to calculate next date
    const latestOccurrence = await this.occurrenceAdapter.getLatestOccurrenceByTaskId(taskId);
    
    // Calculate next occurrence date
    let nextDate = this.calculateNextDate(latestOccurrence, updatedRecurrence);

    // Handle period transitions for habits+
    nextDate = await this.handlePeriodTransition(updatedRecurrence, nextDate);

    // Calculate target and limit dates
    const { targetDate, limitDate } = this.calculateDates(nextDate, updatedRecurrence, initialDates, latestOccurrence);

    // Create the occurrence
    const occurrenceData: CreateOccurrenceDTO = {
      associatedTaskId: taskId,
      startDate: nextDate,
      targetDate,
      limitDate,
      targetTimeConsumption: initialDates?.targetTimeConsumption ?? latestOccurrence?.targetTimeConsumption ?? undefined,
    };

    await this.occurrenceAdapter.createOccurrence(occurrenceData);
  }

  /**
   * Check if task is a unique task (single occurrence)
   */
  private isUniqueTask(recurrence: TaskRecurrence): boolean {
    return recurrence.maxOccurrences === 1 && 
           !recurrence.interval && 
           (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0) &&
           (!recurrence.daysOfMonth || recurrence.daysOfMonth.length === 0);
  }

  /**
   * Create a single occurrence for unique tasks
   */
  private async createUniqueOccurrence(
    taskId: number,
    initialDates?: {
      targetDate?: Date;
      limitDate?: Date;
      targetTimeConsumption?: number;
    }
  ): Promise<void> {
    const startDate = new Date();
    
    const targetDate = initialDates?.targetDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    const limitDate = initialDates?.limitDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const occurrenceData: CreateOccurrenceDTO = {
      associatedTaskId: taskId,
      startDate,
      targetDate,
      limitDate,
      targetTimeConsumption: initialDates?.targetTimeConsumption,
    };

    await this.occurrenceAdapter.createOccurrence(occurrenceData);
  }

  /**
   * Calculate the next occurrence date
   */
  private calculateNextDate(
    latestOccurrence: any,
    recurrence: TaskRecurrence
  ): Date {
    if (!latestOccurrence) {
      return new Date(); // First occurrence
    }
    
    return this.dateCalculator.calculateNextOccurrenceDate(
      latestOccurrence.startDate,
      recurrence
    );
  }

  /**
   * Handle period transitions for habits+
   */
  private async handlePeriodTransition(
    recurrence: TaskRecurrence,
    nextDate: Date
  ): Promise<Date> {
    const hasCompletedAllInPeriod = this.periodManager.hasReachedPeriodLimit(recurrence);
    
    if (!hasCompletedAllInPeriod) {
      return nextDate;
    }

    // Move to next period
    const currentPeriodStart = recurrence.lastPeriodStart ?? new Date();
    const nextPeriodStart = this.periodManager.getNextPeriodStartByType(currentPeriodStart, recurrence);

    // Reset counter and update period
    await this.recurrenceAdapter.updateRecurrence(recurrence.id, {
      completedOccurrences: 0,
      lastPeriodStart: nextPeriodStart,
    });
    
    // Update local copy
    recurrence.completedOccurrences = 0;
    recurrence.lastPeriodStart = nextPeriodStart;

    // Calculate first occurrence in new period
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      return this.dateCalculator.getFirstDayOfWeekInPeriod(
        nextPeriodStart,
        recurrence.daysOfWeek as DayOfWeek[]
      );
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      return this.dateCalculator.getFirstDayOfMonthInPeriod(
        nextPeriodStart,
        recurrence.daysOfMonth
      );
    } else {
      return nextPeriodStart;
    }
  }

  /**
   * Calculate target and limit dates
   */
  private calculateDates(
    nextDate: Date,
    recurrence: TaskRecurrence,
    initialDates?: {
      targetDate?: Date;
      limitDate?: Date;
      targetTimeConsumption?: number;
    },
    latestOccurrence?: any
  ): { targetDate: Date; limitDate: Date } {
    if (initialDates?.targetDate || initialDates?.limitDate) {
      const calculated = this.dateCalculator.calculateOccurrenceDates(nextDate, recurrence);
      return {
        targetDate: initialDates.targetDate ?? calculated.targetDate,
        limitDate: initialDates.limitDate ?? calculated.limitDate,
      };
    }

    return this.dateCalculator.calculateOccurrenceDates(nextDate, recurrence);
  }
}

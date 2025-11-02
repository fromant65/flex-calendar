/**
 * Scheduling Service Types
 * 
 * Interface definitions for dependency injection and testing
 */

import type { TaskRecurrence, CreateRecurrenceDTO } from "../types";

export interface TaskSchedulerServiceInterface {
  getRecurrence(recurrenceId: number): Promise<TaskRecurrence | undefined>;
  shouldCreateNextOccurrence(taskId: number): Promise<boolean>;
  updateRecurrencePeriod(recurrenceId: number): Promise<void>;
  incrementCompletedOccurrences(recurrenceId: number, occurrenceStartDate: Date): Promise<void>;
  createNextOccurrence(
    taskId: number,
    initialDates?: {
      targetDate?: Date;
      limitDate?: Date;
      targetTimeConsumption?: number;
    }
  ): Promise<void>;
  previewNextOccurrenceDate(taskId: number): Promise<Date | null>;
  processRecurringTasks(userId: string): Promise<void>;
  createFixedTaskEvents(
    taskId: number,
    ownerId: string,
    config: {
      startDateTime: Date;
      endDateTime: Date;
      recurrence: CreateRecurrenceDTO;
    }
  ): Promise<void>;
}

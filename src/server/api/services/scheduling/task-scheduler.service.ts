/**
 * Task Scheduler Service - handles recurrence logic and automatic occurrence creation
 */

import { TaskAdapter, OccurrenceAdapter, CalendarEventAdapter, RecurrenceAdapter } from "../../adapter";
import type { CreateOccurrenceDTO, DayOfWeek, TaskRecurrence, CreateRecurrenceDTO } from "../types";
import { TaskAnalyticsService } from "../analytics/task-analytics.service";
import { RecurrenceDateCalculator } from "./recurrence-date-calculator.service";
import { PeriodManager } from "./period-manager.service";
import { OccurrenceCreationService } from "./occurrence-creation.service";
import { OccurrencePreviewService } from "./occurrence-preview.service";
import { FixedTaskService } from "./fixed-task.service";

export class TaskSchedulerService {
  private taskAdapter: TaskAdapter;
  private occurrenceAdapter: OccurrenceAdapter;
  private eventAdapter: CalendarEventAdapter;
  private recurrenceAdapter: RecurrenceAdapter;
  private analyticsService: TaskAnalyticsService;
  private dateCalculator: RecurrenceDateCalculator;
  private periodManager: PeriodManager;
  private occurrenceCreation: OccurrenceCreationService;
  private occurrencePreview: OccurrencePreviewService;
  private fixedTaskService: FixedTaskService;

  constructor() {
    this.taskAdapter = new TaskAdapter();
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.eventAdapter = new CalendarEventAdapter();
    this.recurrenceAdapter = new RecurrenceAdapter();
    this.analyticsService = new TaskAnalyticsService();
    this.dateCalculator = new RecurrenceDateCalculator();
    this.periodManager = new PeriodManager(this.recurrenceAdapter);
    this.occurrenceCreation = new OccurrenceCreationService(
      this.taskAdapter,
      this.occurrenceAdapter,
      this.recurrenceAdapter,
      this.dateCalculator,
      this.periodManager
    );
    this.occurrencePreview = new OccurrencePreviewService(
      this.taskAdapter,
      this.occurrenceAdapter,
      this.dateCalculator,
      this.periodManager
    );
    this.fixedTaskService = new FixedTaskService(
      this.occurrenceAdapter,
      this.eventAdapter
    );
  }

  /**
   * Get recurrence by ID
   */
  async getRecurrence(recurrenceId: number) {
    return await this.recurrenceAdapter.getRecurrenceById(recurrenceId);
  }

  /**
   * Check if a new occurrence should be created for a task
   * Rule: Only create if the last occurrence was completed or skipped
   * For period-based habits: check if we're still within maxOccurrences for current period
   */
  async shouldCreateNextOccurrence(taskId: number): Promise<boolean> {
    const latestOccurrence = await this.occurrenceAdapter.getLatestOccurrenceByTaskId(taskId);

    // If no occurrence exists, create the first one
    if (!latestOccurrence) return true;

    // Only create new occurrence if the last one was completed or skipped
    return latestOccurrence.status === "Completed" || latestOccurrence.status === "Skipped";
  }

  /**
   * Update recurrence period if needed
   * Resets completedOccurrences and updates lastPeriodStart
   */
  async updateRecurrencePeriod(recurrenceId: number): Promise<void> {
    const recurrence = await this.recurrenceAdapter.getRecurrenceById(recurrenceId);
    if (!recurrence) return;

    const currentDate = new Date();
    
    // Delegate to PeriodManager
    if (this.periodManager.shouldStartNewPeriod(recurrence, currentDate)) {
      await this.periodManager.updateRecurrencePeriod(recurrence, currentDate);
    }
  }

  /**
   * Increment completed occurrences counter
   * Called when an occurrence is completed
   * @param recurrenceId - The recurrence ID
   * @param occurrenceStartDate - The startDate of the occurrence being completed
   */
  async incrementCompletedOccurrences(recurrenceId: number, occurrenceStartDate: Date): Promise<void> {
    await this.periodManager.incrementCompletedOccurrences(recurrenceId, occurrenceStartDate);
  }

  /**
   * Check if max occurrences reached for current period
   */
  private hasReachedPeriodLimit(recurrence: TaskRecurrence): boolean {
    return this.periodManager.hasReachedPeriodLimit(recurrence);
  }

  /**
   * Get the end of the current period based on recurrence type
   */
  private getPeriodEnd(
    periodStart: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): Date {
    return this.periodManager.getPeriodEnd(periodStart, recurrence);
  }

  /**
   * Get the start of the next period based on recurrence type
   */
  private getNextPeriodStartByType(
    currentPeriodStart: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): Date {
    return this.periodManager.getNextPeriodStartByType(currentPeriodStart, recurrence);
  }

  /**
   * Calculate the next occurrence date based on recurrence pattern
   */
  calculateNextOccurrenceDate(
    lastOccurrenceDate: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
      maxOccurrences?: number | null;
      completedOccurrences?: number | null;
    }
  ): Date {
    return this.dateCalculator.calculateNextOccurrenceDate(lastOccurrenceDate, recurrence);
  }

  /**
   * Calculate target and limit dates for a recurring occurrence
   * Based on interval and recurrence pattern
   */
  private calculateOccurrenceDates(
    startDate: Date,
    recurrence: {
      interval?: number | null;
      daysOfWeek?: string[] | null;
      daysOfMonth?: number[] | null;
    }
  ): { targetDate: Date; limitDate: Date } {
    return this.dateCalculator.calculateOccurrenceDates(startDate, recurrence);
  }

  /**
   * Check if recurrence has ended
   */
  async hasRecurrenceEnded(
    taskId: number,
    recurrenceId: number
  ): Promise<boolean> {
    const recurrence = await this.recurrenceAdapter.getRecurrenceById(recurrenceId);
    if (!recurrence) return true;

    // Check end date
    if (recurrence.endDate && new Date() > recurrence.endDate) {
      return true;
    }

    // For period-based recurrence, never end based on maxOccurrences
    // (maxOccurrences is per-period, not total)
    // The task continues indefinitely until endDate or manual deactivation

    return false;
  }

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
    // Check if we should create a new occurrence
    const shouldCreate = await this.shouldCreateNextOccurrence(taskId);
    if (!shouldCreate) {
      return; // Latest occurrence is still pending/in progress
    }

    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task?.recurrence) {
      throw new Error("Task does not have recurrence configured");
    }

    // Update period if needed (auto-advance to next period)
    await this.updateRecurrencePeriod(task.recurrence.id);

    // Check if recurrence has ended
    const hasEnded = await this.hasRecurrenceEnded(taskId, task.recurrence.id);
    if (hasEnded) {
      await this.taskAdapter.deleteTask(taskId);
      return;
    }

    // Delegate to OccurrenceCreationService
    await this.occurrenceCreation.createNextOccurrence(taskId, initialDates);
  }

  /**
   * Preview when the next occurrence would be generated if the current one is completed
   * This is for UI preview purposes only, does not create the occurrence
   */
  async previewNextOccurrenceDate(taskId: number): Promise<Date | null> {
    return await this.occurrencePreview.previewNextOccurrenceDate(taskId);
  }

  /**
   * Process all active recurring tasks and create next occurrences
   */
  async processRecurringTasks(userId: string): Promise<void> {
    const tasks = await this.taskAdapter.getTasksWithRecurrenceByOwnerId(userId);
    
    for (const task of tasks) {
      if (task.recurrence && task.isActive) {
        try {
          await this.createNextOccurrence(task.id);
        } catch (error) {
          console.error(`Error creating occurrence for task ${task.id}:`, error);
        }
      }
    }
  }

  /**
   * Create fixed task events automatically based on recurrence pattern
   * This generates all occurrences and calendar events for fixed tasks
   */
  async createFixedTaskEvents(
    taskId: number,
    ownerId: string,
    config: {
      fixedStartTime: string;
      fixedEndTime: string;
      recurrence: CreateRecurrenceDTO;
      targetDate?: Date;
    }
  ): Promise<void> {
    await this.fixedTaskService.createFixedTaskEvents(taskId, ownerId, config);
  }
}

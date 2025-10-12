/**
 * Task Scheduler Service - handles recurrence logic and automatic occurrence creation
 */

import { TaskAdapter, OccurrenceAdapter } from "../adapter";
import { TaskRecurrenceRepository } from "../repository";
import type { CreateOccurrenceDTO, DayOfWeek, TaskRecurrence } from "./types";

export class TaskSchedulerService {
  private taskAdapter: TaskAdapter;
  private occurrenceAdapter: OccurrenceAdapter;
  private recurrenceRepo: TaskRecurrenceRepository;

  constructor() {
    this.taskAdapter = new TaskAdapter();
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.recurrenceRepo = new TaskRecurrenceRepository();
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
   * Check if we need to start a new period
   * Returns true if current date is beyond the period defined by interval
   */
  private shouldStartNewPeriod(
    lastPeriodStart: Date | null,
    interval: number | null,
    currentDate: Date
  ): boolean {
    if (!lastPeriodStart || !interval) return false;

    // Calculate period end (assuming interval is in days for now)
    const periodEnd = new Date(lastPeriodStart);
    periodEnd.setDate(periodEnd.getDate() + interval);

    return currentDate >= periodEnd;
  }

  /**
   * Calculate the start date of the next period
   */
  private getNextPeriodStart(lastPeriodStart: Date, interval: number): Date {
    const nextPeriod = new Date(lastPeriodStart);
    nextPeriod.setDate(nextPeriod.getDate() + interval);
    return nextPeriod;
  }

  /**
   * Update recurrence period if needed
   * Resets completedOccurrences and updates lastPeriodStart
   */
  async updateRecurrencePeriod(recurrenceId: number): Promise<void> {
    const recurrence = await this.recurrenceRepo.findById(recurrenceId);
    if (!recurrence) return;

    const currentDate = new Date();
    
    // Check if we need to start a new period
    if (this.shouldStartNewPeriod(recurrence.lastPeriodStart, recurrence.interval, currentDate)) {
      // Calculate next period start
      const nextPeriodStart = recurrence.lastPeriodStart
        ? this.getNextPeriodStart(recurrence.lastPeriodStart, recurrence.interval!)
        : currentDate;

      // Reset counter and update period start
      await this.recurrenceRepo.updateById(recurrenceId, {
        completedOccurrences: 0,
        lastPeriodStart: nextPeriodStart,
      });
    }
  }

  /**
   * Increment completed occurrences counter
   * Called when an occurrence is completed
   */
  async incrementCompletedOccurrences(recurrenceId: number): Promise<void> {
    const recurrence = await this.recurrenceRepo.findById(recurrenceId);
    if (!recurrence) return;

    const currentDate = new Date();

    // Check if we need to start a new period first
    if (this.shouldStartNewPeriod(recurrence.lastPeriodStart, recurrence.interval, currentDate)) {
      // If completing an occurrence in a new period, start fresh with count = 1
      const nextPeriodStart = recurrence.lastPeriodStart
        ? this.getNextPeriodStart(recurrence.lastPeriodStart, recurrence.interval!)
        : currentDate;

      await this.recurrenceRepo.updateById(recurrenceId, {
        completedOccurrences: 1,
        lastPeriodStart: nextPeriodStart,
      });
    } else {
      // Increment in current period
      await this.recurrenceRepo.updateById(recurrenceId, {
        completedOccurrences: (recurrence.completedOccurrences ?? 0) + 1,
      });
    }
  }

  /**
   * Check if max occurrences reached for current period
   */
  private hasReachedPeriodLimit(recurrence: TaskRecurrence): boolean {
    if (!recurrence.maxOccurrences) return false;
    return (recurrence.completedOccurrences ?? 0) >= recurrence.maxOccurrences;
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
    }
  ): Date {
    const nextDate = new Date(lastOccurrenceDate);

    // Case 1: Interval-based (every N days/weeks/months)
    if (recurrence.interval) {
      // For now, assume interval is in days
      // TODO: Add support for week/month intervals with a unit field
      nextDate.setDate(nextDate.getDate() + recurrence.interval);
      return nextDate;
    }

    // Case 2: Specific days of week (e.g., every Monday and Thursday)
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      return this.getNextDayOfWeek(lastOccurrenceDate, recurrence.daysOfWeek as DayOfWeek[]);
    }

    // Case 3: Specific days of month (e.g., 1st and 15th of each month)
    if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      return this.getNextDayOfMonth(lastOccurrenceDate, recurrence.daysOfMonth);
    }

    // Default: next day
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  /**
   * Get the next occurrence of specified days of week
   */
  private getNextDayOfWeek(fromDate: Date, daysOfWeek: DayOfWeek[]): Date {
    const dayMap: Record<DayOfWeek, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const targetDays = daysOfWeek.map((day) => dayMap[day]).sort((a, b) => a - b);
    const currentDay = fromDate.getDay();
    const nextDate = new Date(fromDate);

    // Find the next target day
    let daysToAdd = 0;
    let found = false;

    for (const targetDay of targetDays) {
      if (targetDay > currentDay) {
        daysToAdd = targetDay - currentDay;
        found = true;
        break;
      }
    }

    // If no day found in current week, get first day of next week
    if (!found) {
      daysToAdd = 7 - currentDay + targetDays[0]!;
    }

    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  /**
   * Get the next occurrence of specified days of month
   */
  private getNextDayOfMonth(fromDate: Date, daysOfMonth: number[]): Date {
    const sortedDays = [...daysOfMonth].sort((a, b) => a - b);
    const currentDay = fromDate.getDate();
    const currentMonth = fromDate.getMonth();
    const currentYear = fromDate.getFullYear();

    // Try to find a day in the current month
    for (const day of sortedDays) {
      if (day > currentDay) {
        return new Date(currentYear, currentMonth, day);
      }
    }

    // If no day found in current month, go to next month
    const nextMonth = currentMonth + 1;
    return new Date(currentYear, nextMonth, sortedDays[0]!);
  }

  /**
   * Check if recurrence has ended
   */
  async hasRecurrenceEnded(
    taskId: number,
    recurrenceId: number
  ): Promise<boolean> {
    const recurrence = await this.recurrenceRepo.findById(recurrenceId);
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
  async createNextOccurrence(taskId: number): Promise<void> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task || !task.recurrence) {
      throw new Error("Task does not have recurrence configured");
    }

    // Check if we should create a new occurrence
    const shouldCreate = await this.shouldCreateNextOccurrence(taskId);
    if (!shouldCreate) {
      return; // Latest occurrence is still pending/in progress
    }

    // Update period if needed (auto-advance to next period)
    await this.updateRecurrencePeriod(task.recurrence.id);

    // Refresh recurrence data after potential period update
    const updatedRecurrence = await this.recurrenceRepo.findById(task.recurrence.id);
    if (!updatedRecurrence) return;

    // Check if recurrence has ended
    const hasEnded = await this.hasRecurrenceEnded(taskId, task.recurrence.id);
    if (hasEnded) {
      await this.taskAdapter.updateTask(taskId, { isActive: false });
      return;
    }

    // Check if we've reached the period limit
    if (this.hasReachedPeriodLimit(updatedRecurrence)) {
      // Schedule occurrence for the start of next period
      const nextPeriodStart = updatedRecurrence.lastPeriodStart
        ? this.getNextPeriodStart(updatedRecurrence.lastPeriodStart, updatedRecurrence.interval!)
        : new Date();

      const occurrenceData: CreateOccurrenceDTO = {
        associatedTaskId: taskId,
        startDate: nextPeriodStart,
      };

      await this.occurrenceAdapter.createOccurrence(occurrenceData);
    } else {
      // Create occurrence for current period
      const latestOccurrence = await this.occurrenceAdapter.getLatestOccurrenceByTaskId(taskId);
      const baseDate = latestOccurrence?.startDate ?? updatedRecurrence.creationDate;

      // Calculate next occurrence date within current period
      const nextDate = this.calculateNextOccurrenceDate(baseDate, updatedRecurrence);

      const occurrenceData: CreateOccurrenceDTO = {
        associatedTaskId: taskId,
        startDate: nextDate,
      };

      await this.occurrenceAdapter.createOccurrence(occurrenceData);
    }
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
}

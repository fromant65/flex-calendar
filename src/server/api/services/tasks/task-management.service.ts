/**
 * Task Management Service
 * 
 * Handles CRUD operations for tasks.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { TaskAdapter } from "../../adapter";
import type { CreateTaskDTO, UpdateTaskDTO } from "../types";

export class TaskManagementService {
  private taskAdapter: TaskAdapter;

  constructor() {
    this.taskAdapter = new TaskAdapter();
  }

  /**
   * Create a new task (without occurrences/events creation)
   * Note: Call TaskSchedulerService to create initial occurrences
   */
  async createTask(userId: string, data: CreateTaskDTO) {
    // Validate recurrence pattern based on task type
    if (data.recurrence) {
      this.validateRecurrence(data);
    }

    // Validate fixed task requirements
    if (data.isFixed) {
      if (!data.fixedStartTime || !data.fixedEndTime) {
        throw new Error("Fixed tasks must have fixedStartTime and fixedEndTime defined");
      }

      const isFixedUnique = data.targetDate && (!data.recurrence?.daysOfWeek && !data.recurrence?.daysOfMonth);
      const isFixedRepetitive = data.recurrence && (data.recurrence.daysOfWeek || data.recurrence.daysOfMonth);

      if (!isFixedUnique && !isFixedRepetitive) {
        throw new Error(
          "Fixed tasks must either have a targetDate (fixed unique) or recurrence with daysOfWeek/daysOfMonth (fixed repetitive)"
        );
      }

      if (isFixedRepetitive && !data.recurrence?.endDate) {
        throw new Error(
          "Fixed repetitive tasks must have an endDate to limit event generation"
        );
      }
    }

    // Ensure all tasks have recurrence (even unique tasks with maxOccurrences=1)
    const recurrenceData = data.recurrence ?? {
      maxOccurrences: 1,
    };

    const taskData = {
      ...data,
      recurrence: recurrenceData,
    };

    return await this.taskAdapter.createTask(userId, taskData);
  }

  /**
   * Validate recurrence pattern based on task type
   * Ensures Hábito+, Recurrente Finita, and Fija Repetitiva use only ONE recurrence type
   */
  private validateRecurrence(data: CreateTaskDTO) {
    const rec = data.recurrence;
    if (!rec) return;

    const hasInterval = rec.interval !== undefined && rec.interval !== null;
    const hasDaysOfWeek = rec.daysOfWeek !== undefined && rec.daysOfWeek !== null && rec.daysOfWeek.length > 0;
    const hasDaysOfMonth = rec.daysOfMonth !== undefined && rec.daysOfMonth !== null && rec.daysOfMonth.length > 0;
    
    // Determine task type based on recurrence pattern
    const isHabitPlus = hasInterval && rec.lastPeriodStart && (hasDaysOfWeek || hasDaysOfMonth);
    const isHabit = hasInterval && rec.lastPeriodStart && !hasDaysOfWeek && !hasDaysOfMonth;
    const isFinite = rec.maxOccurrences && !rec.lastPeriodStart;
    const isFixedRepetitive = data.isFixed && (hasDaysOfWeek || hasDaysOfMonth);

    // For Hábito+: interval is required, but only ONE of daysOfWeek or daysOfMonth
    if (isHabitPlus) {
      if (hasDaysOfWeek && hasDaysOfMonth) {
        throw new Error(
          "Hábito+ tasks must use only ONE recurrence type: interval with daysOfWeek OR interval with daysOfMonth (cannot use both)"
        );
      }
    }

    // For Recurrente Finita and Fija Repetitiva: only ONE of daysOfWeek or daysOfMonth
    if ((isFinite || isFixedRepetitive) && !isHabit) {
      if (hasDaysOfWeek && hasDaysOfMonth) {
        throw new Error(
          "Recurrent tasks must use only ONE pattern: daysOfWeek OR daysOfMonth (cannot use both)"
        );
      }
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: number) {
    return await this.taskAdapter.getTaskById(taskId);
  }

  /**
   * Get task with recurrence details
   */
  async getTaskWithDetails(taskId: number) {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task) return undefined;

    const nextOccurrence = await this.taskAdapter.getNextOccurrence(taskId);

    return {
      ...task,
      nextOccurrence,
    };
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string) {
    return await this.taskAdapter.getTasksWithRecurrenceByOwnerId(userId);
  }

  /**
   * Get active tasks for a user
   */
  async getUserActiveTasks(userId: string) {
    return await this.taskAdapter.getActiveTasksByOwnerId(userId);
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, data: UpdateTaskDTO) {
    return await this.taskAdapter.updateTask(taskId, data);
  }

  /**
   * Delete a task (soft delete)
   */
  async deleteTask(taskId: number) {
    return await this.taskAdapter.deleteTask(taskId);
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: number) {
    return await this.taskAdapter.completeTask(taskId);
  }

  /**
   * Deactivate a task
   */
  async deactivateTask(taskId: number) {
    return await this.taskAdapter.updateTask(taskId, { isActive: false });
  }
}

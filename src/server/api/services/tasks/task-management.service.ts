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

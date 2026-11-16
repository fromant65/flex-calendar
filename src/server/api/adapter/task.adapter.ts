/**
 * Task Adapter - connects service layer with repository layer for tasks
 */

import {
  TaskRepository,
  TaskOccurrenceRepository,
} from "../repository";
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  Task,
  TaskWithDetails,
} from "../services/types";
import { normalizeDates, normalizeDatesArray } from "../helpers";

export class TaskAdapter {
  private taskRepo: TaskRepository;
  private occurrenceRepo: TaskOccurrenceRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.occurrenceRepo = new TaskOccurrenceRepository();
  }

  /**
   * Create a new task with optional recurrence
   */
  async createTask(ownerId: string, data: CreateTaskDTO): Promise<Task> {
    let fixedStartTime = data.fixedStartTime ?? null;
    let fixedEndTime = data.fixedEndTime ?? null;

    // Backward-compatible bridge for legacy input using targetDate/limitDate in fixed tasks.
    if (data.isFixed && !fixedStartTime && !fixedEndTime && data.targetDate && data.limitDate) {
      const startDate = new Date(data.targetDate);
      const endDate = new Date(data.limitDate);
      fixedStartTime = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}:${String(startDate.getSeconds()).padStart(2, "0")}`;
      fixedEndTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:${String(endDate.getSeconds()).padStart(2, "0")}`;
    }

    const task = await this.taskRepo.create({
      ownerId,
      name: data.name,
      description: data.description ?? null,
      importance: data.importance,
      difficulty: data.difficulty,
      isDivisible: data.isDivisible,
      urgencyThresholdAt: data.urgencyThresholdAt ?? null,
      durationMinutes: data.durationMinutes ?? null,
      isFixed: data.isFixed,
      fixedStartTime,
      fixedEndTime,
    });

    return task;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: number): Promise<Task | undefined> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return undefined;
    
    // Normalize dates to ensure they are Date objects for SuperJSON serialization
    return normalizeDates(task, ['completedAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get task with its recurrence details
   */
  async getTaskWithRecurrence(taskId: number): Promise<TaskWithDetails | undefined> {
    const task = await this.taskRepo.findWithRecurrence(taskId);
    
    if (!task) return undefined;

    return task;
  }

  /**
   * Get all tasks for a user
   */
  async getTasksByOwnerId(ownerId: string): Promise<Task[]> {
    const tasks = await this.taskRepo.findByOwnerId(ownerId);
    // Normalize dates for all tasks
    return normalizeDatesArray(tasks, ['completedAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get active tasks for a user
   */
  async getActiveTasksByOwnerId(ownerId: string): Promise<Task[]> {
    const tasks = await this.taskRepo.findActiveByOwnerId(ownerId);
    // Normalize dates for all tasks
    return normalizeDatesArray(tasks, ['completedAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get tasks with recurrence for a user
   */
  async getTasksWithRecurrenceByOwnerId(ownerId: string): Promise<TaskWithDetails[]> {
    const tasksWithRecurrence = await this.taskRepo.findByOwnerIdWithRecurrence(ownerId);

    return tasksWithRecurrence;
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, data: UpdateTaskDTO): Promise<Task | undefined> {
    return await this.taskRepo.updateById(taskId, data);
  }

  /**
   * Mark task as completed
   */
  async completeTask(taskId: number): Promise<Task | undefined> {
    return await this.taskRepo.updateById(taskId, { 
      status: "completed",
      completedAt: new Date(),
    });
  }

  /**
   * Delete a task (soft delete by setting isActive to false)
   */
  async deleteTask(taskId: number): Promise<Task | undefined> {
    return await this.taskRepo.updateById(taskId, { status: "paused" });
  }

  /**
   * Hard delete a task
   */
  async hardDeleteTask(taskId: number): Promise<boolean> {
    return await this.taskRepo.deleteById(taskId);
  }

  /**
   * Get the next active occurrence for a task
   */
  async getNextOccurrence(taskId: number) {
    const activeOccurrences = await this.occurrenceRepo.findActiveByTaskId(taskId);
    return activeOccurrences[0]; // First one is the earliest due to ordering
  }
}

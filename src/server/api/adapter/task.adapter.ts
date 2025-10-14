/**
 * Task Adapter - connects service layer with repository layer for tasks
 */

import {
  TaskRepository,
  TaskRecurrenceRepository,
  TaskOccurrenceRepository,
} from "../repository";
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  Task,
  TaskWithDetails,
  CreateRecurrenceDTO,
  TaskRecurrence,
  TaskType,
} from "../services/types";
import { calculateTaskType } from "../helpers";

export class TaskAdapter {
  private taskRepo: TaskRepository;
  private recurrenceRepo: TaskRecurrenceRepository;
  private occurrenceRepo: TaskOccurrenceRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.recurrenceRepo = new TaskRecurrenceRepository();
    this.occurrenceRepo = new TaskOccurrenceRepository();
  }

  /**
   * Create a new task with optional recurrence
   */
  async createTask(ownerId: string, data: CreateTaskDTO): Promise<Task> {
    let recurrenceId: number | null = null;

    // Create recurrence if provided
    if (data.recurrence) {
      const recurrence = await this.createRecurrence(data.recurrence);
      recurrenceId = recurrence.id;
    }

    // Create the task
    const task = await this.taskRepo.create({
      ownerId,
      name: data.name,
      description: data.description ?? null,
      importance: data.importance ?? 5,
      recurrenceId,
      isActive: true,
    });

    return task;
  }

  /**
   * Create a recurrence pattern
   */
  async createRecurrence(data: CreateRecurrenceDTO) {
    return await this.recurrenceRepo.create({
      interval: data.interval ?? null,
      daysOfWeek: data.daysOfWeek ?? null,
      daysOfMonth: data.daysOfMonth ?? null,
      maxOccurrences: data.maxOccurrences ?? null,
      completedOccurrences: 0,
      lastPeriodStart: data.lastPeriodStart ?? null,
      endDate: data.endDate ?? null,
    });
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: number): Promise<Task | undefined> {
    return await this.taskRepo.findById(taskId);
  }

  /**
   * Get task with its recurrence details
   */
  async getTaskWithRecurrence(taskId: number): Promise<TaskWithDetails | undefined> {
    const task = await this.taskRepo.findWithRecurrence(taskId);
    
    if (!task) return undefined;
    
    return {
      ...task,
      taskType: calculateTaskType(task.recurrence),
    };
  }

  /**
   * Get all tasks for a user
   */
  async getTasksByOwnerId(ownerId: string): Promise<Task[]> {
    return await this.taskRepo.findByOwnerId(ownerId);
  }

  /**
   * Get active tasks for a user
   */
  async getActiveTasksByOwnerId(ownerId: string): Promise<Task[]> {
    return await this.taskRepo.findActiveByOwnerId(ownerId);
  }

  /**
   * Get tasks with recurrence for a user
   */
  async getTasksWithRecurrenceByOwnerId(ownerId: string): Promise<TaskWithDetails[]> {
    const tasksWithRecurrence = await this.taskRepo.findByOwnerIdWithRecurrence(ownerId);
    
    // Add calculated taskType to each task
    return tasksWithRecurrence.map((task) => ({
      ...task,
      taskType: calculateTaskType(task.recurrence),
    }));
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, data: UpdateTaskDTO): Promise<Task | undefined> {
    return await this.taskRepo.updateById(taskId, data);
  }

  /**
   * Delete a task (soft delete by setting isActive to false)
   */
  async deleteTask(taskId: number): Promise<Task | undefined> {
    return await this.taskRepo.updateById(taskId, { isActive: false });
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

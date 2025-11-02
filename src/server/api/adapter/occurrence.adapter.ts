/**
 * Occurrence Adapter - connects service layer with repository layer for task occurrences
 */

import { TaskOccurrenceRepository, CalendarEventRepository, TaskRecurrenceRepository } from "../repository";
import type {
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  TaskOccurrence,
  TaskOccurrenceStatus,
} from "../services/types";
import { calculateTaskType } from "../helpers";

export class OccurrenceAdapter {
  private occurrenceRepo: TaskOccurrenceRepository;
  private eventRepo: CalendarEventRepository;
  private recurrenceRepo: TaskRecurrenceRepository;

  constructor() {
    this.occurrenceRepo = new TaskOccurrenceRepository();
    this.eventRepo = new CalendarEventRepository();
    this.recurrenceRepo = new TaskRecurrenceRepository();
  }

  /**
   * Create a new task occurrence
   */
  async createOccurrence(data: CreateOccurrenceDTO): Promise<TaskOccurrence> {
    const occurrence = await this.occurrenceRepo.create({
      associatedTaskId: data.associatedTaskId,
      startDate: data.startDate,
      limitDate: data.limitDate ?? null,
      targetDate: data.targetDate ?? null,
      targetTimeConsumption: data.targetTimeConsumption ?? null,
      timeConsumed: 0,
      status: "Pending",
      urgency: 0,
    });
    return occurrence as TaskOccurrence;
  }

  /**
   * Get occurrence by ID
   */
  async getOccurrenceById(occurrenceId: number): Promise<TaskOccurrence | undefined> {
    const occurrence = await this.occurrenceRepo.findById(occurrenceId);
    return occurrence ? (occurrence as TaskOccurrence) : undefined;
  }

  /**
   * Get occurrence with task details
   */
  async getOccurrenceWithTask(occurrenceId: number) {
    return await this.occurrenceRepo.findWithTask(occurrenceId);
  }

  /**
   * Get all occurrences for a task
   */
  async getOccurrencesByTaskId(taskId: number) {
    return await this.occurrenceRepo.findByTaskId(taskId);
  }

  /**
   * Get occurrences by status
   */
  async getOccurrencesByTaskIdAndStatus(taskId: number, status: TaskOccurrenceStatus) {
    return await this.occurrenceRepo.findByTaskIdAndStatus(taskId, status);
  }

  /**
   * Get occurrences in a date range
   */
  async getOccurrencesByDateRange(startDate: Date, endDate: Date, userId?: string) {
    const occurrences = await this.occurrenceRepo.findByDateRange(startDate, endDate, userId);
    
    // Enrich each occurrence's task with taskType
    const enrichedOccurrences = await Promise.all(
      occurrences.map(async (occurrence) => {
        if (occurrence.task) {
          // Get recurrence for the task using the recurrenceId
          let recurrence = null;
          if (occurrence.task.recurrenceId) {
            recurrence = await this.recurrenceRepo.findById(occurrence.task.recurrenceId);
          }
          
          // Calculate and add taskType
          return {
            ...occurrence,
            task: {
              ...occurrence.task,
              taskType: calculateTaskType(recurrence, occurrence.task),
            },
          };
        }
        return occurrence;
      })
    );
    
    return enrichedOccurrences;
  }

  /**
   * Get all occurrences with task details for a user
   */
  async getOccurrencesWithTaskByUserId(userId: string) {
    const occurrences = await this.occurrenceRepo.findByOwnerIdWithTask(userId);
    
    // Enrich each occurrence's task with taskType
    const enrichedOccurrences = await Promise.all(
      occurrences.map(async (occurrence: any) => {
        if (occurrence.task) {
          // Get recurrence for the task using the recurrenceId
          let recurrence = null;
          if (occurrence.task.recurrenceId) {
            recurrence = await this.recurrenceRepo.findById(occurrence.task.recurrenceId);
          }
          
          // Calculate and add taskType
          return {
            ...occurrence,
            task: {
              ...occurrence.task,
              taskType: calculateTaskType(recurrence, occurrence.task),
            },
          };
        }
        return occurrence;
      })
    );
    
    return enrichedOccurrences;
  }

  /**
   * Get active (Pending or In Progress) occurrences for a task
   */
  async getActiveOccurrencesByTaskId(taskId: number) {
    return await this.occurrenceRepo.findActiveByTaskId(taskId);
  }

  /**
   * Get the latest occurrence for a task
   */
  async getLatestOccurrenceByTaskId(taskId: number) {
    return await this.occurrenceRepo.findLatestByTaskId(taskId);
  }

  /**
   * Update an occurrence
   */
  async updateOccurrence(occurrenceId: number, data: UpdateOccurrenceDTO) {
    return await this.occurrenceRepo.updateById(occurrenceId, data);
  }

  /**
   * Update occurrence time consumed
   */
  async updateTimeConsumed(occurrenceId: number, additionalTime: number) {
    const occurrence = await this.occurrenceRepo.findById(occurrenceId);
    if (!occurrence) return undefined;

    const currentTime = occurrence.timeConsumed ?? 0;
    return await this.occurrenceRepo.updateById(occurrenceId, {
      timeConsumed: currentTime + additionalTime,
    });
  }

  /**
   * Mark occurrence as completed
   */
  async completeOccurrence(occurrenceId: number, completedAt?: Date) {
    return await this.occurrenceRepo.updateById(occurrenceId, {
      status: "Completed",
      completedAt: completedAt ?? new Date(),
    });
  }

  /**
   * Mark occurrence as skipped
   */
  async skipOccurrence(occurrenceId: number) {
    return await this.occurrenceRepo.updateById(occurrenceId, {
      status: "Skipped",
    });
  }

  /**
   * Update occurrence urgency
   */
  async updateUrgency(occurrenceId: number, urgency: number) {
    return await this.occurrenceRepo.updateById(occurrenceId, { urgency });
  }

  /**
   * Delete an occurrence
   */
  async deleteOccurrence(occurrenceId: number): Promise<boolean> {
    return await this.occurrenceRepo.deleteById(occurrenceId);
  }

  /**
   * Get total time consumed for an occurrence from its events
   */
  async getTotalTimeFromEvents(occurrenceId: number): Promise<number> {
    const events = await this.eventRepo.findByOccurrenceId(occurrenceId);
    return events.reduce((total, event) => total + (event.dedicatedTime ?? 0), 0);
  }

  /**
   * Get completed occurrences by owner and date range (for timeline/analytics)
   */
  async getCompletedOccurrencesByOwnerInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.occurrenceRepo.findCompletedByOwnerIdInDateRange(userId, startDate, endDate);
  }

  /**
   * Get occurrences by owner with task (for analytics)
   */
  async getOccurrencesByOwnerWithTask(userId: string) {
    return await this.occurrenceRepo.findByOwnerIdWithTask(userId);
  }

  /**
   * Get occurrences by task ID (for analytics)
   */
  async getOccurrencesByTaskIdRaw(taskId: number) {
    return await this.occurrenceRepo.findByTaskId(taskId);
  }
}

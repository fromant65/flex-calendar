/**
 * Occurrence Adapter - connects service layer with repository layer for task occurrences
 */

import { TaskOccurrenceRepository, CalendarEventRepository } from "../repository";
import type {
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  TaskOccurrence,
  TaskOccurrenceStatus,
  OccurrenceWithTask,
} from "../services/types";
import { normalizeDates, normalizeDatesArray } from "../helpers";

export class OccurrenceAdapter {
  private occurrenceRepo: TaskOccurrenceRepository;
  private eventRepo: CalendarEventRepository;

  constructor() {
    this.occurrenceRepo = new TaskOccurrenceRepository();
    this.eventRepo = new CalendarEventRepository();
  }

  /**
   * Create a new task occurrence
   */
  async createOccurrence(data: CreateOccurrenceDTO): Promise<TaskOccurrence> {
    const occurrence = await this.occurrenceRepo.create({
      taskId: data.taskId,
      slotStartAt: data.slotStartAt ?? null,
      slotEndAt: data.slotEndAt ?? null,
      dueAt: data.dueAt ?? null,
      tentativeAt: data.tentativeAt ?? null,
      targetTimeMinutes: data.targetTimeMinutes ?? null,
      timeSpentMinutes: 0,
      status: data.slotStartAt && data.slotEndAt ? "pending" : "unassigned",
    });
    return occurrence as TaskOccurrence;
  }

  /**
   * Get occurrence by ID
   */
  async getOccurrenceById(occurrenceId: number): Promise<TaskOccurrence | undefined> {
    const occurrence = await this.occurrenceRepo.findById(occurrenceId);
    if (!occurrence) return undefined;
    
    // Normalize dates to ensure they are Date objects for SuperJSON serialization
    return normalizeDates(occurrence as TaskOccurrence, ['slotStartAt', 'slotEndAt', 'dueAt', 'tentativeAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get occurrence with task details
   */
  async getOccurrenceWithTask(occurrenceId: number): Promise<OccurrenceWithTask | undefined> {
    const result = await this.occurrenceRepo.findWithTask(occurrenceId);
    return result as OccurrenceWithTask | undefined;
  }

  /**
   * Get all occurrences for a task
   */
  async getOccurrencesByTaskId(taskId: number): Promise<TaskOccurrence[]> {
    const occurrences = await this.occurrenceRepo.findByTaskId(taskId);
    // Normalize dates for all occurrences
    return normalizeDatesArray(occurrences, ['slotStartAt', 'slotEndAt', 'dueAt', 'tentativeAt', 'createdAt', 'updatedAt']) as TaskOccurrence[];
  }

  /**
   * Get occurrences by status
   */
  async getOccurrencesByTaskIdAndStatus(taskId: number, status: TaskOccurrenceStatus) {
    const occurrences = await this.occurrenceRepo.findByTaskIdAndStatus(taskId, status);
    // Normalize dates for all occurrences
    return normalizeDatesArray(occurrences, ['slotStartAt', 'slotEndAt', 'dueAt', 'tentativeAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get occurrences in a date range
   */
  async getOccurrencesByDateRange(startDate: Date, endDate: Date, userId?: string) {
    return await this.occurrenceRepo.findByDateRange(startDate, endDate, userId);
  }

  /**
   * Get all occurrences with task details for a user
   */
  async getOccurrencesWithTaskByUserId(userId: string): Promise<OccurrenceWithTask[]> {
    return await this.occurrenceRepo.findByOwnerIdWithTask(userId);
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
    return await this.occurrenceRepo.updateById(occurrenceId, {
      slotStartAt: data.slotStartAt,
      slotEndAt: data.slotEndAt,
      dueAt: data.dueAt,
      tentativeAt: data.tentativeAt,
      targetTimeMinutes: data.targetTimeMinutes,
      timeSpentMinutes: data.timeSpentMinutes,
      status: this.normalizeStatus(data.status),
    });
  }

  /**
   * Update occurrence time consumed
   */
  async updateTimeConsumed(occurrenceId: number, additionalTime: number) {
    const occurrence = await this.occurrenceRepo.findById(occurrenceId);
    if (!occurrence) return undefined;

    const currentTime = occurrence.timeSpentMinutes ?? 0;
    return await this.occurrenceRepo.updateById(occurrenceId, {
      timeSpentMinutes: currentTime + additionalTime,
    });
  }

  /**
   * Mark occurrence as completed
   */
  async completeOccurrence(occurrenceId: number, completedAt?: Date) {
    return await this.occurrenceRepo.updateById(occurrenceId, {
      status: "completed",
      completedAt: completedAt ?? new Date(),
    });
  }

  /**
   * Mark occurrence as skipped
   */
  async skipOccurrence(occurrenceId: number) {
    return await this.occurrenceRepo.updateById(occurrenceId, {
      status: "skipped",
    });
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

  private normalizeStatus(status?: TaskOccurrenceStatus) {
    return status;
  }
}

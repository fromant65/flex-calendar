/**
 * Occurrence Adapter - connects service layer with repository layer for task occurrences
 */

import { TaskOccurrenceRepository, CalendarEventRepository } from "../repository";
import type {
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  TaskOccurrence,
  TaskOccurrenceStatus,
} from "../services/types";

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
  async createOccurrence(data: CreateOccurrenceDTO) {
    return await this.occurrenceRepo.create({
      associatedTaskId: data.associatedTaskId,
      startDate: data.startDate,
      limitDate: data.limitDate ?? null,
      targetDate: data.targetDate ?? null,
      targetTimeConsumption: data.targetTimeConsumption ?? null,
      timeConsumed: 0,
      status: "Pending",
      urgency: 0,
    });
  }

  /**
   * Get occurrence by ID
   */
  async getOccurrenceById(occurrenceId: number) {
    return await this.occurrenceRepo.findById(occurrenceId);
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
  async getOccurrencesByDateRange(startDate: Date, endDate: Date) {
    return await this.occurrenceRepo.findByDateRange(startDate, endDate);
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
  async completeOccurrence(occurrenceId: number) {
    return await this.occurrenceRepo.updateById(occurrenceId, {
      status: "Completed",
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
}

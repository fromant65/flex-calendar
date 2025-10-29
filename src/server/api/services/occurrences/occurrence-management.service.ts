/**
 * Occurrence Management Service
 * 
 * Handles basic CRUD operations for task occurrences.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { OccurrenceAdapter, CalendarEventAdapter } from "../../adapter";
import { TaskAnalyticsService } from "../analytics/task-analytics.service";
import type { CreateOccurrenceDTO, UpdateOccurrenceDTO } from "../types";

export class OccurrenceManagementService {
  private occurrenceAdapter: OccurrenceAdapter;
  private eventAdapter: CalendarEventAdapter;
  private analyticsService: TaskAnalyticsService;

  constructor() {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.eventAdapter = new CalendarEventAdapter();
    this.analyticsService = new TaskAnalyticsService();
  }

  /**
   * Create a task occurrence manually
   */
  async createOccurrence(data: CreateOccurrenceDTO) {
    return await this.occurrenceAdapter.createOccurrence(data);
  }

  /**
   * Get occurrence by ID
   */
  async getOccurrence(occurrenceId: number) {
    return await this.occurrenceAdapter.getOccurrenceById(occurrenceId);
  }

  /**
   * Get occurrence with task details
   */
  async getOccurrenceWithTask(occurrenceId: number) {
    return await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
  }

  /**
   * Get all occurrences for a task
   */
  async getTaskOccurrences(taskId: number) {
    return await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
  }

  /**
   * Get occurrences in a date range
   */
  async getOccurrencesByDateRange(startDate: Date, endDate: Date, userId?: string) {
    return await this.occurrenceAdapter.getOccurrencesByDateRange(startDate, endDate, userId);
  }

  /**
   * Update an occurrence
   */
  async updateOccurrence(occurrenceId: number, data: UpdateOccurrenceDTO) {
    return await this.occurrenceAdapter.updateOccurrence(occurrenceId, data);
  }

  /**
   * Get all occurrences for a user with task details and urgency enrichment
   */
  async getUserOccurrencesWithTask(userId: string) {
    const occurrences = await this.occurrenceAdapter.getOccurrencesWithTaskByUserId(userId);
    
    // Enrich with urgency
    return occurrences.map(occ => 
      this.analyticsService.enrichOccurrenceWithUrgency(occ)
    );
  }

  /**
   * Get events for a specific occurrence
   */
  async getOccurrenceEvents(occurrenceId: number) {
    return await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
  }
}

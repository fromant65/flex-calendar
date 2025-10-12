/**
 * Calendar Event Adapter - connects service layer with repository layer for calendar events
 */

import { CalendarEventRepository, TaskOccurrenceRepository } from "../repository";
import type { CreateCalendarEventDTO, UpdateCalendarEventDTO } from "../services/types";

export class CalendarEventAdapter {
  private eventRepo: CalendarEventRepository;
  private occurrenceRepo: TaskOccurrenceRepository;

  constructor() {
    this.eventRepo = new CalendarEventRepository();
    this.occurrenceRepo = new TaskOccurrenceRepository();
  }

  /**
   * Create a new calendar event
   */
  async createEvent(ownerId: string, data: CreateCalendarEventDTO) {
    return await this.eventRepo.create({
      ownerId,
      context: data.context ?? null,
      associatedOccurrenceId: data.associatedOccurrenceId ?? null,
      isFixed: data.isFixed,
      start: data.start,
      finish: data.finish,
      isCompleted: false,
      dedicatedTime: 0,
    });
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: number) {
    return await this.eventRepo.findById(eventId);
  }

  /**
   * Get event with occurrence and task details
   */
  async getEventWithDetails(eventId: number) {
    return await this.eventRepo.findWithDetails(eventId);
  }

  /**
   * Get all events for a user
   */
  async getEventsByOwnerId(ownerId: string) {
    return await this.eventRepo.findByOwnerId(ownerId);
  }

  /**
   * Get events with details for a user
   */
  async getEventsWithDetailsByOwnerId(ownerId: string) {
    return await this.eventRepo.findByOwnerIdWithDetails(ownerId);
  }

  /**
   * Get events in a date range
   */
  async getEventsByDateRange(ownerId: string, startDate: Date, endDate: Date) {
    return await this.eventRepo.findByDateRange(ownerId, startDate, endDate);
  }

  /**
   * Get events for a specific occurrence
   */
  async getEventsByOccurrenceId(occurrenceId: number) {
    return await this.eventRepo.findByOccurrenceId(occurrenceId);
  }

  /**
   * Get incomplete events for an occurrence
   */
  async getIncompleteEventsByOccurrenceId(occurrenceId: number) {
    return await this.eventRepo.findIncompleteByOccurrenceId(occurrenceId);
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: number, data: UpdateCalendarEventDTO) {
    return await this.eventRepo.updateById(eventId, data);
  }

  /**
   * Mark event as completed and update dedicated time
   */
  async completeEvent(eventId: number) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) return undefined;

    // Calculate dedicated time from start to finish
    const dedicatedTime =
      (event.finish.getTime() - event.start.getTime()) / (1000 * 60 * 60); // Convert to hours

    return await this.eventRepo.updateById(eventId, {
      isCompleted: true,
      dedicatedTime,
    });
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: number): Promise<boolean> {
    return await this.eventRepo.deleteById(eventId);
  }

  /**
   * Sync occurrence time consumed from its events
   */
  async syncOccurrenceTimeFromEvents(occurrenceId: number) {
    const events = await this.eventRepo.findByOccurrenceId(occurrenceId);
    const totalTime = events.reduce((sum, event) => sum + (event.dedicatedTime ?? 0), 0);

    return await this.occurrenceRepo.updateById(occurrenceId, {
      timeConsumed: totalTime,
    });
  }
}

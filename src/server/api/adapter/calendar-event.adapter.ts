/**
 * Calendar Event Adapter - connects service layer with repository layer for calendar events
 */

import { CalendarEventRepository, TaskOccurrenceRepository, TaskRecurrenceRepository } from "../repository";
import type { CreateCalendarEventDTO, UpdateCalendarEventDTO } from "../services/types";
import { calculateTaskType, normalizeDates, normalizeDatesArray } from "../helpers";

export class CalendarEventAdapter {
  private eventRepo: CalendarEventRepository;
  private occurrenceRepo: TaskOccurrenceRepository;
  private recurrenceRepo: TaskRecurrenceRepository;

  constructor() {
    this.eventRepo = new CalendarEventRepository();
    this.occurrenceRepo = new TaskOccurrenceRepository();
    this.recurrenceRepo = new TaskRecurrenceRepository();
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
    const event = await this.eventRepo.findById(eventId);
    if (!event) return undefined;
    
    // Normalize dates to ensure they are Date objects for SuperJSON serialization
    return normalizeDates(event, ['start', 'finish', 'completedAt', 'createdAt', 'updatedAt']);
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
    const events = await this.eventRepo.findByOwnerId(ownerId);
    // Normalize dates for all events
    return normalizeDatesArray(events, ['start', 'finish', 'completedAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get events with details for a user
   */
  async getEventsWithDetailsByOwnerId(ownerId: string) {
    const events = await this.eventRepo.findByOwnerIdWithDetails(ownerId);
    
    // Enrich each event's task with taskType
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        if (event.occurrence?.task) {
          // Get recurrence for the task using the recurrenceId
          let recurrence = null;
          if (event.occurrence.task.recurrenceId) {
            recurrence = await this.recurrenceRepo.findById(event.occurrence.task.recurrenceId);
          }
          
          // Calculate and add taskType
          return {
            ...event,
            occurrence: {
              ...event.occurrence,
              task: {
                ...event.occurrence.task,
                taskType: calculateTaskType(recurrence, event.occurrence.task),
              },
            },
          };
        }
        return event;
      })
    );
    
    return enrichedEvents;
  }

  /**
   * Get events in a date range
   */
  async getEventsByDateRange(ownerId: string, startDate: Date, endDate: Date) {
    const events = await this.eventRepo.findByDateRange(ownerId, startDate, endDate);
    // Normalize dates for all events
    return normalizeDatesArray(events, ['start', 'finish', 'completedAt', 'createdAt', 'updatedAt']);
  }

  /**
   * Get events with details in a date range
   */
  async getEventsWithDetailsByDateRange(ownerId: string, startDate: Date, endDate: Date) {
    const events = await this.eventRepo.findByDateRangeWithDetails(ownerId, startDate, endDate);
    
    // Enrich each event's task with taskType
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        if (event.occurrence?.task) {
          // Get recurrence for the task using the recurrenceId
          let recurrence = null;
          if (event.occurrence.task.recurrenceId) {
            recurrence = await this.recurrenceRepo.findById(event.occurrence.task.recurrenceId);
          }
          
          // Calculate and add taskType
          return {
            ...event,
            occurrence: {
              ...event.occurrence,
              task: {
                ...event.occurrence.task,
                taskType: calculateTaskType(recurrence, event.occurrence.task),
              },
            },
          };
        }
        return event;
      })
    );
    
    return enrichedEvents;
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
  async completeEvent(eventId: number, completedAt?: Date) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) return undefined;

    // Calculate dedicated time from start to finish
    const dedicatedTime =
      (event.finish.getTime() - event.start.getTime()) / (1000 * 60 * 60); // Convert to hours

    return await this.eventRepo.updateById(eventId, {
      isCompleted: true,
      dedicatedTime,
      completedAt: completedAt ?? new Date(),
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

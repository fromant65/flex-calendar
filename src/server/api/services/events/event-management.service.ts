/**
 * Event Management Service
 * 
 * Handles basic CRUD operations for calendar events.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { CalendarEventAdapter } from "../../adapter";
import { TaskAnalyticsService } from "../analytics/task-analytics.service";
import type { CreateCalendarEventDTO, UpdateCalendarEventDTO } from "../types";

export class EventManagementService {
  private eventAdapter: CalendarEventAdapter;
  private analyticsService: TaskAnalyticsService;

  constructor() {
    this.eventAdapter = new CalendarEventAdapter();
    this.analyticsService = new TaskAnalyticsService();
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(userId: string, data: CreateCalendarEventDTO) {
    return await this.eventAdapter.createEvent(userId, data);
  }

  /**
   * Get event by ID
   */
  async getCalendarEvent(eventId: number) {
    return await this.eventAdapter.getEventById(eventId);
  }

  /**
   * Get event with details
   */
  async getCalendarEventWithDetails(eventId: number) {
    return await this.eventAdapter.getEventWithDetails(eventId);
  }

  /**
   * Get event with details and enriched urgency
   */
  async getCalendarEventWithDetailsEnriched(eventId: number) {
    const event = await this.eventAdapter.getEventWithDetails(eventId);
    
    if (event?.occurrence) {
      return {
        ...event,
        occurrence: this.analyticsService.enrichOccurrenceWithUrgency(event.occurrence)
      };
    }
    
    return event;
  }

  /**
   * Get all events for a user
   */
  async getUserCalendarEvents(userId: string) {
    return await this.eventAdapter.getEventsByOwnerId(userId);
  }

  /**
   * Get events with details for a user
   */
  async getUserCalendarEventsWithDetails(userId: string) {
    const events = await this.eventAdapter.getEventsWithDetailsByOwnerId(userId);
    
    return events.map(event => {
      if (event.occurrence) {
        return {
          ...event,
          occurrence: this.analyticsService.enrichOccurrenceWithUrgency(event.occurrence)
        };
      }
      return event;
    });
  }

  /**
   * Get events in a date range
   */
  async getCalendarEventsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.eventAdapter.getEventsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get events with details in a date range
   */
  async getCalendarEventsWithDetailsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.eventAdapter.getEventsWithDetailsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get today's events with details and enriched urgency
   */
  async getTodayEventsWithDetails(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await this.eventAdapter.getEventsWithDetailsByDateRange(
      userId,
      today,
      tomorrow
    );
    
    return events.map(event => {
      if (event.occurrence) {
        return {
          ...event,
          occurrence: this.analyticsService.enrichOccurrenceWithUrgency(event.occurrence)
        };
      }
      return event;
    });
  }

  /**
   * Get this week's events with details and enriched urgency
   */
  async getWeekEventsWithDetails(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const events = await this.eventAdapter.getEventsWithDetailsByDateRange(
      userId,
      startOfWeek,
      endOfWeek
    );
    
    return events.map(event => {
      if (event.occurrence) {
        return {
          ...event,
          occurrence: this.analyticsService.enrichOccurrenceWithUrgency(event.occurrence)
        };
      }
      return event;
    });
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(eventId: number, data: UpdateCalendarEventDTO) {
    return await this.eventAdapter.updateEvent(eventId, data);
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: number) {
    const event = await this.eventAdapter.getEventById(eventId);
    
    // Prevent deletion of fixed task events
    if (event?.isFixed) {
      throw new Error("Cannot delete events from fixed tasks. Use skip or complete instead.");
    }
    
    const deleted = await this.eventAdapter.deleteEvent(eventId);
    
    // If event was associated with an occurrence, recalculate time consumed
    if (deleted && event?.associatedOccurrenceId) {
      await this.eventAdapter.syncOccurrenceTimeFromEvents(event.associatedOccurrenceId);
    }
    
    return deleted;
  }
}

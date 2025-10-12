/**
 * Task Lifecycle Service - handles CRUD operations and task lifecycle management
 */

import { TaskAdapter, OccurrenceAdapter, CalendarEventAdapter } from "../adapter";
import { TaskAnalyticsService } from "./task-analytics.service";
import { TaskSchedulerService } from "./task-scheduler.service";
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
} from "./types";

export class TaskLifecycleService {
  private taskAdapter: TaskAdapter;
  private occurrenceAdapter: OccurrenceAdapter;
  private eventAdapter: CalendarEventAdapter;
  private analyticsService: TaskAnalyticsService;
  private schedulerService: TaskSchedulerService;

  constructor() {
    this.taskAdapter = new TaskAdapter();
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.eventAdapter = new CalendarEventAdapter();
    this.analyticsService = new TaskAnalyticsService();
    this.schedulerService = new TaskSchedulerService();
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Create a new task
   */
  async createTask(userId: string, data: CreateTaskDTO) {
    const task = await this.taskAdapter.createTask(userId, data);

    // If it's a recurring task, create the first occurrence
    if (data.recurrence) {
      await this.schedulerService.createNextOccurrence(task.id);
    } else {
      // For non-recurring tasks, create a single occurrence
      const occurrenceData: CreateOccurrenceDTO = {
        associatedTaskId: task.id,
        startDate: new Date(), // Default to now
      };
      await this.occurrenceAdapter.createOccurrence(occurrenceData);
    }

    return task;
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
    return await this.taskAdapter.getTasksByOwnerId(userId);
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

  // ==================== OCCURRENCE OPERATIONS ====================

  /**
   * Create a task occurrence manually
   */
  async createOccurrence(data: CreateOccurrenceDTO) {
    const occurrence = await this.occurrenceAdapter.createOccurrence(data);
    
    // Calculate initial urgency
    await this.analyticsService.updateOccurrenceUrgency(occurrence.id);
    
    return occurrence;
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
  async getOccurrencesByDateRange(startDate: Date, endDate: Date) {
    return await this.occurrenceAdapter.getOccurrencesByDateRange(startDate, endDate);
  }

  /**
   * Update an occurrence
   */
  async updateOccurrence(occurrenceId: number, data: UpdateOccurrenceDTO) {
    const updated = await this.occurrenceAdapter.updateOccurrence(occurrenceId, data);
    
    // Recalculate urgency if dates changed
    if (data.targetDate || data.limitDate) {
      await this.analyticsService.updateOccurrenceUrgency(occurrenceId);
    }
    
    return updated;
  }

  /**
   * Complete an occurrence and trigger next occurrence creation if recurring
   */
  async completeOccurrence(occurrenceId: number) {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) {
      throw new Error("Occurrence not found");
    }

    // Mark as completed
    await this.occurrenceAdapter.completeOccurrence(occurrenceId);

    // If the task is recurring, increment counter and create the next occurrence
    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (task?.recurrence) {
      // Increment completed occurrences counter for the period
      await this.schedulerService.incrementCompletedOccurrences(task.recurrence.id);
      
      // Create next occurrence
      await this.schedulerService.createNextOccurrence(task.id);
    }

    return true;
  }

  /**
   * Skip an occurrence and trigger next occurrence creation if recurring
   */
  async skipOccurrence(occurrenceId: number) {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) {
      throw new Error("Occurrence not found");
    }

    // Mark as skipped
    await this.occurrenceAdapter.skipOccurrence(occurrenceId);

    // If the task is recurring, increment counter (skipped counts too) and create the next occurrence
    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (task?.recurrence) {
      // Increment completed occurrences counter for the period (skipped counts)
      await this.schedulerService.incrementCompletedOccurrences(task.recurrence.id);
      
      // Create next occurrence
      await this.schedulerService.createNextOccurrence(task.id);
    }

    return true;
  }

  // ==================== CALENDAR EVENT OPERATIONS ====================

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
   * Get all events for a user
   */
  async getUserCalendarEvents(userId: string) {
    return await this.eventAdapter.getEventsByOwnerId(userId);
  }

  /**
   * Get events with details for a user
   */
  async getUserCalendarEventsWithDetails(userId: string) {
    return await this.eventAdapter.getEventsWithDetailsByOwnerId(userId);
  }

  /**
   * Get events in a date range
   */
  async getCalendarEventsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.eventAdapter.getEventsByDateRange(userId, startDate, endDate);
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(eventId: number, data: UpdateCalendarEventDTO) {
    return await this.eventAdapter.updateEvent(eventId, data);
  }

  /**
   * Complete a calendar event and update occurrence time
   */
  async completeCalendarEvent(eventId: number) {
    const event = await this.eventAdapter.completeEvent(eventId);
    
    // If event is associated with an occurrence, sync time consumed
    if (event?.associatedOccurrenceId) {
      await this.eventAdapter.syncOccurrenceTimeFromEvents(event.associatedOccurrenceId);
      await this.analyticsService.updateOccurrenceUrgency(event.associatedOccurrenceId);
    }
    
    return event;
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: number) {
    const event = await this.eventAdapter.getEventById(eventId);
    const deleted = await this.eventAdapter.deleteEvent(eventId);
    
    // If event was associated with an occurrence, recalculate time consumed
    if (deleted && event?.associatedOccurrenceId) {
      await this.eventAdapter.syncOccurrenceTimeFromEvents(event.associatedOccurrenceId);
    }
    
    return deleted;
  }
}

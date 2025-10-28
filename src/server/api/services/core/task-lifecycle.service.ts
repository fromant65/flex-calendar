/**
 * Task Lifecycle Service - Main Orchestrator
 * 
 * Coordinates between different specialized services to handle the complete task lifecycle.
 * This service acts as a facade, delegating to specialized services for each concern.
 * 
 * Responsibilities:
 * - Orchestrate task creation with initial occurrences/events
 * - Delegate to specialized services for specific operations
 * - Maintain backward compatibility with existing API
 */

import { TaskManagementService } from "../tasks/task-management.service";
import { OccurrenceManagementService } from "../occurrences/occurrence-management.service";
import { OccurrenceCompletionService } from "../occurrences/occurrence-completion.service";
import { BacklogDetectionService } from "../occurrences/backlog-detection.service";
import { EventManagementService } from "../events/event-management.service";
import { EventCompletionService } from "../events/event-completion.service";
import { TaskSchedulerService } from "../scheduling/task-scheduler.service";
import type {
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateOccurrenceDTO,
  UpdateOccurrenceDTO,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
} from "../types";

export class TaskLifecycleService {
  private taskManagement: TaskManagementService;
  private occurrenceManagement: OccurrenceManagementService;
  private occurrenceCompletion: OccurrenceCompletionService;
  private backlogDetection: BacklogDetectionService;
  private eventManagement: EventManagementService;
  private eventCompletion: EventCompletionService;
  private scheduler: TaskSchedulerService;

  constructor() {
    this.taskManagement = new TaskManagementService();
    this.occurrenceManagement = new OccurrenceManagementService();
    this.backlogDetection = new BacklogDetectionService();
    this.scheduler = new TaskSchedulerService();
    this.occurrenceCompletion = new OccurrenceCompletionService(this.scheduler);
    this.eventManagement = new EventManagementService();
    this.eventCompletion = new EventCompletionService(this.scheduler);
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Create a new task with initial occurrences/events
   */
  async createTask(userId: string, data: CreateTaskDTO) {
    // Create task
    const task = await this.taskManagement.createTask(userId, data);

    // Ensure recurrence data exists
    const recurrenceData = data.recurrence ?? { maxOccurrences: 1 };

    // For fixed tasks, create occurrences and calendar events automatically
    if (data.isFixed) {
      await this.scheduler.createFixedTaskEvents(task.id, userId, {
        fixedStartTime: data.fixedStartTime!,
        fixedEndTime: data.fixedEndTime!,
        recurrence: recurrenceData,
      });
    } else {
      // For non-fixed tasks, create the first occurrence
      await this.scheduler.createNextOccurrence(task.id, {
        targetDate: data.targetDate,
        limitDate: data.limitDate,
        targetTimeConsumption: data.targetTimeConsumption,
      });
    }

    return task;
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: number) {
    return await this.taskManagement.getTask(taskId);
  }

  /**
   * Get task with recurrence details
   */
  async getTaskWithDetails(taskId: number) {
    return await this.taskManagement.getTaskWithDetails(taskId);
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string) {
    return await this.taskManagement.getUserTasks(userId);
  }

  /**
   * Get active tasks for a user
   */
  async getUserActiveTasks(userId: string) {
    return await this.taskManagement.getUserActiveTasks(userId);
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, data: UpdateTaskDTO) {
    return await this.taskManagement.updateTask(taskId, data);
  }

  /**
   * Delete a task (soft delete)
   */
  async deleteTask(taskId: number) {
    return await this.taskManagement.deleteTask(taskId);
  }

  // ==================== OCCURRENCE OPERATIONS ====================

  /**
   * Create a task occurrence manually
   */
  async createOccurrence(data: CreateOccurrenceDTO) {
    return await this.occurrenceManagement.createOccurrence(data);
  }

  /**
   * Get occurrence by ID
   */
  async getOccurrence(occurrenceId: number) {
    return await this.occurrenceManagement.getOccurrence(occurrenceId);
  }

  /**
   * Get occurrence with task details
   */
  async getOccurrenceWithTask(occurrenceId: number) {
    return await this.occurrenceManagement.getOccurrenceWithTask(occurrenceId);
  }

  /**
   * Get all occurrences for a task
   */
  async getTaskOccurrences(taskId: number) {
    return await this.occurrenceManagement.getTaskOccurrences(taskId);
  }

  /**
   * Get occurrences in a date range
   */
  async getOccurrencesByDateRange(startDate: Date, endDate: Date) {
    return await this.occurrenceManagement.getOccurrencesByDateRange(startDate, endDate);
  }

  /**
   * Update an occurrence
   */
  async updateOccurrence(occurrenceId: number, data: UpdateOccurrenceDTO) {
    return await this.occurrenceManagement.updateOccurrence(occurrenceId, data);
  }

  /**
   * Complete an occurrence and trigger next occurrence creation if recurring
   */
  async completeOccurrence(occurrenceId: number, completedAt?: Date) {
    return await this.occurrenceCompletion.completeOccurrence(occurrenceId, completedAt);
  }

  /**
   * Skip an occurrence and trigger next occurrence creation if recurring
   */
  async skipOccurrence(occurrenceId: number) {
    return await this.occurrenceCompletion.skipOccurrence(occurrenceId);
  }

  /**
   * Preview when the next occurrence would be generated for a task
   */
  async previewNextOccurrence(taskId: number): Promise<Date | null> {
    return await this.occurrenceCompletion.previewNextOccurrence(taskId);
  }

  /**
   * Detect backlog occurrences
   */
  async detectBacklog(taskId: number) {
    return await this.backlogDetection.detectBacklog(taskId);
  }

  /**
   * Skip all backlog occurrences except the most recent one
   */
  async skipBacklogOccurrences(taskId: number): Promise<number> {
    return await this.backlogDetection.skipBacklogOccurrences(
      taskId,
      (occId) => this.skipOccurrence(occId)
    );
  }

  /**
   * Get all occurrences for a user with task details and urgency enrichment
   */
  async getUserOccurrencesWithTask(userId: string) {
    return await this.occurrenceManagement.getUserOccurrencesWithTask(userId);
  }

  /**
   * Get events for a specific occurrence
   */
  async getOccurrenceEvents(occurrenceId: number) {
    return await this.occurrenceManagement.getOccurrenceEvents(occurrenceId);
  }

  // ==================== CALENDAR EVENT OPERATIONS ====================

  /**
   * Create a calendar event
   */
  async createCalendarEvent(userId: string, data: CreateCalendarEventDTO) {
    return await this.eventManagement.createCalendarEvent(userId, data);
  }

  /**
   * Get event by ID
   */
  async getCalendarEvent(eventId: number) {
    return await this.eventManagement.getCalendarEvent(eventId);
  }

  /**
   * Get event with details
   */
  async getCalendarEventWithDetails(eventId: number) {
    return await this.eventManagement.getCalendarEventWithDetails(eventId);
  }

  /**
   * Get event with details and enriched urgency
   */
  async getCalendarEventWithDetailsEnriched(eventId: number) {
    return await this.eventManagement.getCalendarEventWithDetailsEnriched(eventId);
  }

  /**
   * Get all events for a user
   */
  async getUserCalendarEvents(userId: string) {
    return await this.eventManagement.getUserCalendarEvents(userId);
  }

  /**
   * Get events with details for a user
   */
  async getUserCalendarEventsWithDetails(userId: string) {
    return await this.eventManagement.getUserCalendarEventsWithDetails(userId);
  }

  /**
   * Get events in a date range
   */
  async getCalendarEventsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.eventManagement.getCalendarEventsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get events with details in a date range
   */
  async getCalendarEventsWithDetailsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.eventManagement.getCalendarEventsWithDetailsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get today's events with details and enriched urgency
   */
  async getTodayEventsWithDetails(userId: string) {
    return await this.eventManagement.getTodayEventsWithDetails(userId);
  }

  /**
   * Get this week's events with details and enriched urgency
   */
  async getWeekEventsWithDetails(userId: string) {
    return await this.eventManagement.getWeekEventsWithDetails(userId);
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(eventId: number, data: UpdateCalendarEventDTO) {
    return await this.eventManagement.updateCalendarEvent(eventId, data);
  }

  /**
   * Complete a calendar event and handle task lifecycle based on task type
   */
  async completeCalendarEvent(eventId: number, dedicatedTime?: number, completeOccurrence?: boolean, completedAt?: Date) {
    return await this.eventCompletion.completeCalendarEvent(eventId, dedicatedTime, completeOccurrence, completedAt);
  }

  /**
   * Skip a calendar event
   */
  async skipCalendarEvent(eventId: number, skipOccurrence?: boolean) {
    return await this.eventCompletion.skipCalendarEvent(eventId, skipOccurrence);
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: number) {
    return await this.eventManagement.deleteCalendarEvent(eventId);
  }
}

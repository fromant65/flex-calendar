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
    // Validate fixed task requirements
    if (data.isFixed) {
      // Fixed tasks must have start and end times
      if (!data.fixedStartTime || !data.fixedEndTime) {
        throw new Error("Fixed tasks must have fixedStartTime and fixedEndTime defined");
      }

      // Fixed unique tasks use targetDate, fixed repetitive tasks use daysOfWeek/daysOfMonth
      const isFixedUnique = data.targetDate && (!data.recurrence?.daysOfWeek && !data.recurrence?.daysOfMonth);
      const isFixedRepetitive = data.recurrence && (data.recurrence.daysOfWeek || data.recurrence.daysOfMonth);

      if (!isFixedUnique && !isFixedRepetitive) {
        throw new Error(
          "Fixed tasks must either have a targetDate (fixed unique) or recurrence with daysOfWeek/daysOfMonth (fixed repetitive)"
        );
      }

      // Fixed repetitive tasks MUST have an endDate to avoid infinite generation
      if (isFixedRepetitive && !data.recurrence?.endDate) {
        throw new Error(
          "Fixed repetitive tasks must have an endDate to limit event generation"
        );
      }
    }

    // Ensure all tasks have recurrence (even unique tasks with maxOccurrences=1)
    const recurrenceData = data.recurrence ?? {
      maxOccurrences: 1, // Default for unique tasks
    };

    const taskData = {
      ...data,
      recurrence: recurrenceData,
    };

    const task = await this.taskAdapter.createTask(userId, taskData);

    // For fixed tasks, create occurrences and calendar events automatically
    if (data.isFixed) {
      await this.schedulerService.createFixedTaskEvents(task.id, userId, {
        fixedStartTime: data.fixedStartTime!,
        fixedEndTime: data.fixedEndTime!,
        recurrence: recurrenceData,
      });
    } else {
      // For non-fixed tasks, create the first occurrence (works for all task types)
      // Pass the initial dates for unique tasks
      await this.schedulerService.createNextOccurrence(task.id, {
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
    return await this.taskAdapter.getTasksWithRecurrenceByOwnerId(userId);
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

    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Mark all events associated with this occurrence as completed
    // Instead of deleting them, we complete them with their completedAt timestamp
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      if (!event.isCompleted) {
        await this.eventAdapter.completeEvent(event.id);
      }
    }

    // Mark occurrence as completed with completedAt timestamp
    await this.occurrenceAdapter.completeOccurrence(occurrenceId);

    // Handle task lifecycle based on recurrence
    if (task.recurrence) {
      const recurrence = task.recurrence;

      // Increment completed occurrences counter for the period
      await this.schedulerService.incrementCompletedOccurrences(recurrence.id);
      
      // Tarea Única: maxOccurrences = 1, no interval
      if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
        // Mark task as completed
        await this.taskAdapter.completeTask(task.id);
      }
      // Recurrente Finita: maxOccurrences > 1, no interval
      else if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
        const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
        const completedCount = occurrences.filter(o => o.status === "Completed").length;
        
        if (completedCount < recurrence.maxOccurrences) {
          // Create next occurrence with same parameters as the completed one
          await this.schedulerService.createNextOccurrence(task.id, {
            targetTimeConsumption: occurrence.targetTimeConsumption ?? undefined,
          });
        } else {
          // All occurrences completed, mark task as completed
          await this.taskAdapter.completeTask(task.id);
        }
      }
      // Hábito or Hábito+: has interval (infinite recurrence)
      else if (recurrence.interval) {
        // Create next occurrence based on recurrence pattern
        await this.schedulerService.createNextOccurrence(task.id);
        // Don't mark task as completed for infinite habits
      }
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

    // Delete all events associated with this occurrence
    // Events should be removed when occurrence is completed/skipped
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      await this.eventAdapter.deleteEvent(event.id);
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

  /**
   * Preview when the next occurrence would be generated for a task
   * Useful for showing users when the next occurrence will be created
   */
  async previewNextOccurrence(taskId: number): Promise<Date | null> {
    return await this.schedulerService.previewNextOccurrenceDate(taskId);
  }

  /**
   * Get all occurrences for a user with task details
   * Useful for the task-manager page to show all occurrences grouped by task
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
   * Get event with details and enriched urgency
   */
  async getCalendarEventWithDetailsEnriched(eventId: number) {
    const event = await this.eventAdapter.getEventWithDetails(eventId);
    
    // Enrich occurrence with urgency if it exists
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
    
    // Enrich all occurrences with urgency
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
    
    // Enrich occurrences with urgency
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
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const events = await this.eventAdapter.getEventsWithDetailsByDateRange(
      userId,
      startOfWeek,
      endOfWeek
    );
    
    // Enrich occurrences with urgency
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
   * Complete a calendar event and handle task lifecycle based on task type
   */
  async completeCalendarEvent(eventId: number, dedicatedTime?: number, completeOccurrence?: boolean) {
    // Get event with full details
    const eventDetails = await this.eventAdapter.getEventWithDetails(eventId);
    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // Validate that the event has already started
    const now = new Date();
    if (eventDetails.start > now) {
      throw new Error("Cannot complete an event that hasn't started yet");
    }

    // Calculate dedicated time if not provided (from start to finish)
    const calculatedTime = dedicatedTime ?? 
      (eventDetails.finish.getTime() - eventDetails.start.getTime()) / (1000 * 60 * 60); // Convert to hours

    // Mark event as completed
    const event = await this.eventAdapter.updateEvent(eventId, {
      isCompleted: true,
      dedicatedTime: calculatedTime,
    });

    // If event is associated with an occurrence, handle the task lifecycle
    if (eventDetails.associatedOccurrenceId) {
      const occurrence = eventDetails.occurrence;
      const task = occurrence?.task;

      // Sync time consumed for the occurrence
      await this.eventAdapter.syncOccurrenceTimeFromEvents(eventDetails.associatedOccurrenceId);

      // FIXED TASKS: Completing event completes the occurrence (always)
      if (task?.isFixed) {
        // Mark occurrence as completed
        await this.occurrenceAdapter.updateOccurrence(eventDetails.associatedOccurrenceId, {
          status: "Completed"
        });

        if (task.recurrenceId) {
          const recurrence = await this.schedulerService.getRecurrence(task.recurrenceId);
          
          if (recurrence) {
            // Increment completed occurrences counter
            await this.schedulerService.incrementCompletedOccurrences(task.recurrenceId);

            // Fija Única: maxOccurrences = 1
            if (recurrence.maxOccurrences === 1) {
              // Deactivate task
              await this.taskAdapter.updateTask(task.id, { isActive: false });
            }
            // Fija Repetitiva: Check if all occurrences are completed
            else {
              const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
              const completedCount = occurrences.filter(o => o.status === "Completed").length;
              const totalOccurrences = occurrences.length;
              
              // If all occurrences are completed, deactivate task
              if (completedCount >= totalOccurrences) {
                await this.taskAdapter.updateTask(task.id, { isActive: false });
              }
            }
          }
        }
      }
      // NON-FIXED TASKS: Completing event can optionally complete the occurrence
      else if (completeOccurrence && occurrence) {
        // Complete the occurrence using the existing method
        await this.completeOccurrence(eventDetails.associatedOccurrenceId);
      }
      // Otherwise, only update timeConsumed (already synced above)
    }
    
    return event;
  }

  /**
   * Skip a calendar event (mark event as skipped and optionally skip the occurrence)
   */
  async skipCalendarEvent(eventId: number, skipOccurrence?: boolean) {
    // Get event with full details
    const eventDetails = await this.eventAdapter.getEventWithDetails(eventId);
    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // Mark event as completed=false (skipped)
    const event = await this.eventAdapter.updateEvent(eventId, {
      isCompleted: false,
    });

    // If event is associated with an occurrence and skipOccurrence is true
    if (eventDetails.associatedOccurrenceId && skipOccurrence) {
      const occurrence = eventDetails.occurrence;
      const task = occurrence?.task;

      // For FIXED tasks, always skip the occurrence
      if (task?.isFixed) {
        await this.skipOccurrence(eventDetails.associatedOccurrenceId);
      }
      // For NON-FIXED tasks, skip only if requested
      else {
        await this.skipOccurrence(eventDetails.associatedOccurrenceId);
      }
    }
    
    return event;
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

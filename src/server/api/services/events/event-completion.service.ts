/**
 * Event Completion Service
 * 
 * Handles completion and skipping logic for calendar events.
 * Manages task lifecycle when events are completed/skipped.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { CalendarEventAdapter, OccurrenceAdapter, TaskAdapter } from "../../adapter";
import { TaskSchedulerService } from "../scheduling/task-scheduler.service";
import type { TaskSchedulerServiceInterface } from "../scheduling";
import { calculateTaskType } from "../../helpers";

export class EventCompletionService {
  private eventAdapter: CalendarEventAdapter;
  private occurrenceAdapter: OccurrenceAdapter;
  private taskAdapter: TaskAdapter;
  private schedulerService: TaskSchedulerServiceInterface;

  constructor(schedulerService?: TaskSchedulerServiceInterface) {
    this.eventAdapter = new CalendarEventAdapter();
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.taskAdapter = new TaskAdapter();
    this.schedulerService = schedulerService ?? new TaskSchedulerService();
  }

  /**
   * Complete a calendar event and handle task lifecycle based on task type
   */
  async completeCalendarEvent(eventId: number, dedicatedTime?: number, completeOccurrence?: boolean, completedAt?: Date) {
    const eventDetails = await this.eventAdapter.getEventWithDetails(eventId);
    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // Validate that the event has already started
    const now = new Date();
    if (eventDetails.start > now) {
      throw new Error("Cannot complete an event that hasn't started yet");
    }

    // Calculate dedicated time if not provided
    const calculatedTime = dedicatedTime ?? 
      (eventDetails.finish.getTime() - eventDetails.start.getTime()) / (1000 * 60 * 60);

    // Mark event as completed
    const event = await this.eventAdapter.updateEvent(eventId, {
      isCompleted: true,
      dedicatedTime: calculatedTime,
      completedAt: completedAt ?? new Date(),
    });

    // Handle occurrence and task lifecycle if event is associated with an occurrence
    if (eventDetails.associatedOccurrenceId) {
      await this.handleOccurrenceCompletion(eventDetails, completeOccurrence, completedAt);
    }
    
    return event;
  }

  /**
   * Skip a calendar event (mark as skipped and optionally skip the occurrence)
   */
  async skipCalendarEvent(eventId: number, skipOccurrence?: boolean) {
    const eventDetails = await this.eventAdapter.getEventWithDetails(eventId);
    if (!eventDetails) {
      throw new Error("Event not found");
    }

    // Mark event as not completed (skipped)
    const event = await this.eventAdapter.updateEvent(eventId, {
      isCompleted: false,
    });

    // Handle occurrence skipping - ALWAYS for fixed tasks, or if explicitly requested
    // Check both task.isFixed AND eventDetails.isFixed as fallback
    if (eventDetails.associatedOccurrenceId) {
      const task = eventDetails.occurrence?.task;
      if (task?.isFixed || eventDetails.isFixed || skipOccurrence) {
        await this.handleOccurrenceSkip(eventDetails);
      }
    }
    
    return event;
  }

  /**
   * Handle occurrence completion when an event is completed
   */
  private async handleOccurrenceCompletion(
    eventDetails: any,
    completeOccurrence?: boolean,
    completedAt?: Date
  ): Promise<void> {
    const occurrence = eventDetails.occurrence;
    const task = occurrence?.task;

    // Sync time consumed for the occurrence
    await this.eventAdapter.syncOccurrenceTimeFromEvents(eventDetails.associatedOccurrenceId);

    // FIXED TASKS: Completing event always completes the occurrence
    // Check both task.isFixed AND eventDetails.isFixed as fallback
    if (task?.isFixed || eventDetails.isFixed) {
      console.log("Completing fixed task occurrence...");
      await this.completeFixedTaskOccurrence(eventDetails.associatedOccurrenceId, task, occurrence, completedAt);
    }
    // NON-FIXED TASKS: Complete occurrence only if requested
    else if (completeOccurrence && occurrence) {
      console.log("Completing non-fixed task occurrence...");
      await this.completeOccurrence(eventDetails.associatedOccurrenceId, completedAt);
    }
  }

  /**
   * Complete a fixed task occurrence
   */
  private async completeFixedTaskOccurrence(
    occurrenceId: number,
    task: any,
    occurrence: any,
    completedAt?: Date
  ): Promise<void> {
    await this.occurrenceAdapter.completeOccurrence(occurrenceId, completedAt);

    if (task.recurrenceId) {
      const recurrence = await this.schedulerService.getRecurrence(task.recurrenceId);
      
      if (recurrence) {
        await this.schedulerService.incrementCompletedOccurrences(task.recurrenceId, occurrence.startDate);

        // Fija Única: maxOccurrences = 1
        if (recurrence.maxOccurrences === 1) {
          await this.taskAdapter.updateTask(task.id, { isActive: false });
        }
        // Fija Repetitiva: Check if all occurrences are completed
        else {
          await this.checkAndDeactivateIfAllCompleted(task.id);
        }
      }
    }
  }

  /**
   * Check if all occurrences are completed/skipped and deactivate task
   * This ensures tasks are deactivated when all work is done (either completed or skipped)
   */
  private async checkAndDeactivateIfAllCompleted(taskId: number): Promise<void> {
    const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const finishedCount = occurrences.filter(o => o.status === "Completed" || o.status === "Skipped").length;
    const totalOccurrences = occurrences.length;
    
    if (finishedCount >= totalOccurrences) {
      await this.taskAdapter.updateTask(taskId, { isActive: false });
    }
  }

  /**
   * Complete an occurrence (delegates to OccurrenceCompletionService logic)
   */
  private async completeOccurrence(occurrenceId: number, completedAt?: Date): Promise<void> {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) return;

    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (!task) return;

    // Mark all events as completed
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      if (!event.isCompleted) {
        await this.eventAdapter.completeEvent(event.id, completedAt);
      }
    }

    await this.occurrenceAdapter.completeOccurrence(occurrenceId, completedAt);

    if (task.recurrence) {
      const recurrence = task.recurrence;
      await this.schedulerService.incrementCompletedOccurrences(recurrence.id, occurrence.startDate);
      
      if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
        await this.taskAdapter.completeTask(task.id);
      } else if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
        const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
        const completedCount = occurrences.filter(o => o.status === "Completed").length;
        
        if (completedCount < recurrence.maxOccurrences) {
          await this.schedulerService.createNextOccurrence(task.id, {
            targetTimeConsumption: occurrence.targetTimeConsumption ?? undefined,
          });
        } else {
          await this.taskAdapter.completeTask(task.id);
        }
      } else if (recurrence.interval) {
        await this.schedulerService.createNextOccurrence(task.id);
      }
    }
  }

  /**
   * Handle occurrence skipping when an event is skipped
   */
  private async handleOccurrenceSkip(eventDetails: any): Promise<void> {
    const occurrence = eventDetails.occurrence;
    const task = occurrence?.task;

    // For FIXED tasks or if explicitly requested, skip the occurrence
    if (task?.isFixed || eventDetails.skipOccurrence) {
      await this.skipOccurrence(eventDetails.associatedOccurrenceId);
    }
  }

  /**
   * Skip an occurrence (delegates to OccurrenceCompletionService logic)
   */
  private async skipOccurrence(occurrenceId: number): Promise<void> {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) return;

    // Delete all events
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      await this.eventAdapter.deleteEvent(event.id);
    }

    await this.occurrenceAdapter.skipOccurrence(occurrenceId);

    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (task?.recurrence) {
      await this.schedulerService.incrementCompletedOccurrences(task.recurrence.id, occurrence.startDate);
      
      // Use the helper to determine task type
      const taskType = calculateTaskType(task.recurrence, task);
      
      // Only Hábito, Hábito+ and Recurrente Finita generate occurrences dynamically
      const needsDynamicGeneration = taskType === "Hábito" || taskType === "Hábito +" || taskType === "Recurrente Finita";
      
      if (needsDynamicGeneration) {
        await this.schedulerService.createNextOccurrence(task.id);
      } else {
        // For tasks with pre-generated occurrences (Fija Única, Fija Repetitiva)
        // Check if all occurrences are completed/skipped and deactivate task
        if (task.recurrence.maxOccurrences === 1) {
          // Single occurrence task - deactivate immediately
          await this.taskAdapter.updateTask(task.id, { isActive: false });
        } else {
          // Multiple occurrences - check if all are finished
          await this.checkAndDeactivateIfAllCompleted(task.id);
        }
      }
    }
  }
}

/**
 * Occurrence Completion Service
 * 
 * Handles completion and skipping logic for occurrences.
 * Manages the task lifecycle when occurrences are completed/skipped.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { OccurrenceAdapter, CalendarEventAdapter, TaskAdapter } from "../../adapter";
import { TaskSchedulerService } from "../scheduling/task-scheduler.service";
import type { TaskSchedulerServiceInterface } from "../scheduling";

export class OccurrenceCompletionService {
  private occurrenceAdapter: OccurrenceAdapter;
  private eventAdapter: CalendarEventAdapter;
  private taskAdapter: TaskAdapter;
  private schedulerService: TaskSchedulerServiceInterface;

  constructor(schedulerService?: TaskSchedulerServiceInterface) {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.eventAdapter = new CalendarEventAdapter();
    this.taskAdapter = new TaskAdapter();
    this.schedulerService = schedulerService ?? new TaskSchedulerService();
  }

  /**
   * Complete an occurrence and trigger next occurrence creation if recurring
   */
  async completeOccurrence(occurrenceId: number, completedAt?: Date) {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) {
      throw new Error("Occurrence not found");
    }

    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Mark all events associated with this occurrence as completed
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      if (!event.isCompleted) {
        await this.eventAdapter.completeEvent(event.id, completedAt);
      }
    }

    // Mark occurrence as completed with completedAt timestamp
    await this.occurrenceAdapter.completeOccurrence(occurrenceId, completedAt);

    // Handle task lifecycle based on recurrence
    if (task.recurrence) {
      const recurrence = task.recurrence;

      // Increment completed occurrences counter for the period
      await this.schedulerService.incrementCompletedOccurrences(recurrence.id, occurrence.startDate);
      
      // Tarea Única: maxOccurrences = 1, no interval
      if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
        await this.taskAdapter.completeTask(task.id);
      }
      // Tarea Fija (Única o Repetitiva): Check if all occurrences are done
      else if (task.isFixed) {
        await this.checkAndCompleteIfAllDone(task.id);
      }
      // Recurrente Finita: maxOccurrences > 1, no interval
      else if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
        const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
        // Count both completed and skipped occurrences as "discarded"
        const discardedCount = occurrences.filter(o => o.status === "Completed" || o.status === "Skipped").length;
        
        if (discardedCount < recurrence.maxOccurrences) {
          await this.schedulerService.createNextOccurrence(task.id, {
            targetTimeConsumption: occurrence.targetTimeConsumption ?? undefined,
          });
        } else {
          await this.taskAdapter.completeTask(task.id);
        }
      }
      // Hábito or Hábito+: has interval (infinite recurrence)
      else if (recurrence.interval) {
        await this.schedulerService.createNextOccurrence(task.id);
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
    const events = await this.eventAdapter.getEventsByOccurrenceId(occurrenceId);
    for (const event of events) {
      await this.eventAdapter.deleteEvent(event.id);
    }

    // Mark as skipped
    await this.occurrenceAdapter.skipOccurrence(occurrenceId);

    // Handle task lifecycle based on recurrence (same logic as completion)
    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (task?.recurrence) {
      const recurrence = task.recurrence;

      // Increment completed occurrences counter for the period (skipped counts)
      await this.schedulerService.incrementCompletedOccurrences(recurrence.id, occurrence.startDate);
      
      // Tarea Única: maxOccurrences = 1, no interval
      if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
        await this.taskAdapter.completeTask(task.id);
      }
      // Tarea Fija (Única o Repetitiva): Check if all occurrences are done
      else if (task.isFixed) {
        await this.checkAndCompleteIfAllDone(task.id);
      }
      // Recurrente Finita: maxOccurrences > 1, no interval
      else if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
        const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
        const discardedCount = occurrences.filter(o => o.status === "Completed" || o.status === "Skipped").length;
        
        if (discardedCount < recurrence.maxOccurrences) {
          await this.schedulerService.createNextOccurrence(task.id);
        } else {
          await this.taskAdapter.completeTask(task.id);
        }
      }
      // Hábito or Hábito+: has interval (infinite recurrence)
      else if (recurrence.interval) {
        await this.schedulerService.createNextOccurrence(task.id);
      }
    }

    return true;
  }

  /**
   * Check if all occurrences are completed/skipped and complete the task
   * This ensures tasks are completed when all work is done (either completed or skipped)
   */
  private async checkAndCompleteIfAllDone(taskId: number): Promise<void> {
    const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const finishedCount = occurrences.filter(o => o.status === "Completed" || o.status === "Skipped").length;
    const totalOccurrences = occurrences.length;
    
    if (finishedCount >= totalOccurrences) {
      await this.taskAdapter.completeTask(taskId);
    }
  }

  /**
   * Preview when the next occurrence would be generated for a task
   */
  async previewNextOccurrence(taskId: number): Promise<Date | null> {
    return await this.schedulerService.previewNextOccurrenceDate(taskId);
  }
}

/**
 * Occurrence Completion Service
 * 
 * Handles completion and skipping logic for occurrences.
 * Manages the task lifecycle when occurrences are completed/skipped.
 * Extracted from TaskLifecycleService for better modularity.
 * 
 * Refactored to use TaskStrategyFactory (Strategy Pattern) to eliminate
 * conditional logic for different task types.
 */

import { OccurrenceAdapter, CalendarEventAdapter, TaskAdapter } from "../../adapter";
import { TaskSchedulerService } from "../scheduling/task-scheduler.service";
import type { TaskSchedulerServiceInterface } from "../scheduling";
import { TaskStrategyFactory } from "../task-strategies/task-strategy.factory";
import { calculateTaskType } from "../task-strategies/utils/calculate-task-type";
import type { OccurrenceContext } from "../task-strategies/base/strategy-types";
import type { OccurrenceWithTask, TaskOccurrence } from "../types";

export class OccurrenceCompletionService {
  private occurrenceAdapter: OccurrenceAdapter;
  private eventAdapter: CalendarEventAdapter;
  private taskAdapter: TaskAdapter;
  private schedulerService: TaskSchedulerServiceInterface;
  private strategyFactory: TaskStrategyFactory;

  constructor(schedulerService?: TaskSchedulerServiceInterface) {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.eventAdapter = new CalendarEventAdapter();
    this.taskAdapter = new TaskAdapter();
    this.schedulerService = schedulerService ?? new TaskSchedulerService();
    
    // Initialize strategy factory with dependencies
    this.strategyFactory = new TaskStrategyFactory({
      scheduler: this.schedulerService,
    });
  }

  /**
   * Complete an occurrence and trigger next occurrence creation if recurring
   */
  async completeOccurrence(occurrenceId: number, completedAt?: Date, timeConsumed?: number) {
    const occurrence = await this.occurrenceAdapter.getOccurrenceWithTask(occurrenceId);
    if (!occurrence) {
      throw new Error("Occurrence not found");
    }

    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Update time consumed if provided
    if (timeConsumed !== undefined) {
      await this.occurrenceAdapter.updateOccurrence(occurrenceId, { timeConsumed });
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

    // Handle task lifecycle using Strategy Pattern
    if (task.recurrence) {
      const recurrence = task.recurrence;

      // Get the appropriate strategy for this task type
      const taskType = calculateTaskType(recurrence, task);
      const strategy = this.strategyFactory.getStrategy(task, recurrence);

      // Build context for the strategy
      const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
      const context: OccurrenceContext = {
        task,
        recurrence,
        occurrence: occurrence as OccurrenceWithTask,
        allOccurrences: allOccurrences as TaskOccurrence[],
      };

      // Execute strategy lifecycle action
      const action = await strategy.onOccurrenceCompleted(context);

      // Apply the action returned by the strategy
      switch (action.type) {
        case 'CREATE_NEXT_OCCURRENCE':
          await this.schedulerService.createNextOccurrence(task.id, {
            targetTimeConsumption: occurrence.targetTimeConsumption ?? undefined,
          });
          break;
        
        case 'COMPLETE_TASK':
          await this.taskAdapter.completeTask(task.id);
          break;
        
        case 'DEACTIVATE_TASK':
          // Deactivate is same as complete for now (can be extended later)
          await this.taskAdapter.completeTask(task.id);
          break;
        
        case 'NO_ACTION':
          // No action needed
          break;
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

    // Handle task lifecycle using Strategy Pattern (same as completion)
    const task = await this.taskAdapter.getTaskWithRecurrence(occurrence.task.id);
    if (task?.recurrence) {
      const recurrence = task.recurrence;

      // Get the appropriate strategy for this task type
      const taskType = calculateTaskType(recurrence, task);
      const strategy = this.strategyFactory.getStrategy(task, recurrence);

      // Build context for the strategy
      const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(task.id);
      const context: OccurrenceContext = {
        task,
        recurrence,
        occurrence: occurrence as OccurrenceWithTask,
        allOccurrences: allOccurrences as TaskOccurrence[],
      };

      // Execute strategy lifecycle action
      const action = await strategy.onOccurrenceSkipped(context);

      // Apply the action returned by the strategy
      switch (action.type) {
        case 'CREATE_NEXT_OCCURRENCE':
          await this.schedulerService.createNextOccurrence(task.id);
          break;
        
        case 'COMPLETE_TASK':
          await this.taskAdapter.completeTask(task.id);
          break;
        
        case 'DEACTIVATE_TASK':
          // Deactivate is same as complete for now (can be extended later)
          await this.taskAdapter.completeTask(task.id);
          break;
        
        case 'NO_ACTION':
          // No action needed
          break;
      }
    }

    return true;
  }

  /**
   * Preview when the next occurrence would be generated for a task
   */
  async previewNextOccurrence(taskId: number): Promise<Date | null> {
    return await this.schedulerService.previewNextOccurrenceDate(taskId);
  }
}

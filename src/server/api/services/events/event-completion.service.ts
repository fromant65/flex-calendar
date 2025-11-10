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
import { TaskStrategyFactory } from "../task-strategies/task-strategy.factory";
import { OccurrenceCompletionService } from "../occurrences/occurrence-completion.service";
import type { EventContext, OccurrenceContext } from "../task-strategies/base/strategy-types";
import type { 
  Task, 
  TaskOccurrence, 
  EventWithDetails, 
  TaskWithDetails,
  OccurrenceWithTask 
} from "../types";

export class EventCompletionService {
  private eventAdapter: CalendarEventAdapter;
  private occurrenceAdapter: OccurrenceAdapter;
  private taskAdapter: TaskAdapter;
  private schedulerService: TaskSchedulerServiceInterface;
  private strategyFactory: TaskStrategyFactory;
  private occurrenceCompletionService: OccurrenceCompletionService;

  constructor(schedulerService?: TaskSchedulerServiceInterface) {
    this.eventAdapter = new CalendarEventAdapter();
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.taskAdapter = new TaskAdapter();
    this.schedulerService = schedulerService ?? new TaskSchedulerService();
    
    // Initialize strategy factory
    this.strategyFactory = new TaskStrategyFactory({
      scheduler: this.schedulerService,
    });
    
    // Initialize occurrence completion service for delegation
    this.occurrenceCompletionService = new OccurrenceCompletionService(this.schedulerService);
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

    // Use provided completedAt or default to now
    const actualCompletedAt = completedAt ?? new Date();

    // Mark event as completed
    const event = await this.eventAdapter.updateEvent(eventId, {
      isCompleted: true,
      dedicatedTime: calculatedTime,
      completedAt: actualCompletedAt,
    });

    // Handle occurrence and task lifecycle if event is associated with an occurrence
    if (eventDetails.associatedOccurrenceId) {
      await this.handleOccurrenceCompletion(
        eventDetails as EventWithDetails & { occurrence?: OccurrenceWithTask | null },
        completeOccurrence,
        actualCompletedAt
      );
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

    // Delete the event (skipped events are removed)
    await this.eventAdapter.deleteEvent(eventId);

    // Handle occurrence skipping if associated with an occurrence
    if (eventDetails.associatedOccurrenceId) {
      await this.handleOccurrenceSkip(
        eventDetails as EventWithDetails & { occurrence?: OccurrenceWithTask | null },
        skipOccurrence
      );
    }
    
    return eventDetails;
  }

  /**
   * Handle occurrence completion when an event is completed
   */
  private async handleOccurrenceCompletion(
    eventDetails: EventWithDetails & { occurrence?: OccurrenceWithTask | null },
    completeOccurrence?: boolean,
    completedAt?: Date
  ): Promise<void> {
    const occurrence = eventDetails.occurrence;
    const task = occurrence?.task;

    // Guard: must have an associatedOccurrenceId
    if (!eventDetails.associatedOccurrenceId) {
      return;
    }

    // Sync time consumed for the occurrence
    await this.eventAdapter.syncOccurrenceTimeFromEvents(eventDetails.associatedOccurrenceId);

    // FIXED TASKS: Completing event always completes the occurrence
    // NON-FIXED TASKS: Complete occurrence only if requested
    const shouldCompleteOccurrence = (task?.isFixed || eventDetails.isFixed) || completeOccurrence;
    
    if (shouldCompleteOccurrence && occurrence) {
      console.log("Completing occurrence via event...");
      // Delegate to OccurrenceCompletionService to handle the full lifecycle
      // This will mark the occurrence as completed, complete any other events,
      // and trigger next occurrence creation using the strategy pattern
      await this.occurrenceCompletionService.completeOccurrence(
        eventDetails.associatedOccurrenceId,
        completedAt
      );
    }
  }

  /**
   * Handle occurrence skipping when an event is skipped
   */
  private async handleOccurrenceSkip(
    eventDetails: EventWithDetails & { occurrence?: OccurrenceWithTask | null },
    skipOccurrence?: boolean
  ): Promise<void> {
    const occurrence = eventDetails.occurrence;
    const task = occurrence?.task;

    // Guard: must have an associatedOccurrenceId
    if (!eventDetails.associatedOccurrenceId) {
      return;
    }

    // Sync time consumed for the occurrence before skipping
    await this.eventAdapter.syncOccurrenceTimeFromEvents(eventDetails.associatedOccurrenceId);

    // FIXED TASKS: Skipping event always skips the occurrence
    // NON-FIXED TASKS: Skip occurrence only if requested
    const shouldSkipOccurrence = (task?.isFixed || eventDetails.isFixed) || skipOccurrence;
    
    if (shouldSkipOccurrence && occurrence) {
      console.log("Skipping occurrence via event...");
      // Delegate to OccurrenceCompletionService to handle the full lifecycle
      // This will delete all events, mark occurrence as skipped,
      // and trigger next occurrence creation using the strategy pattern
      await this.occurrenceCompletionService.skipOccurrence(eventDetails.associatedOccurrenceId);
    }
  }
}

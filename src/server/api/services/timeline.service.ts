/**
 * Timeline Service - Business logic for timeline data aggregation
 */

import { TaskAdapter, OccurrenceAdapter, CalendarEventAdapter } from "../adapter";
import type { TaskWithRecurrence, OccurrenceWithTask, EventWithDetails, TaskOccurrenceStatus } from "~/types";

export interface TimelineData {
  tasks: TaskWithRecurrence[];
  occurrences: OccurrenceWithTask[];
  events: EventWithDetails[];
}

export class TimelineService {
  private taskAdapter = new TaskAdapter();
  private occurrenceAdapter = new OccurrenceAdapter();
  private eventAdapter = new CalendarEventAdapter();

  /**
   * Get timeline data for a user within a date range
   * Returns all occurrences and events regardless of status
   */
  async getTimelineData(userId: string, startDate: Date, endDate: Date): Promise<TimelineData> {
    // Get all occurrences within the date range (regardless of status)
    const occurrencesWithTask = await this.occurrenceAdapter.getOccurrencesByDateRange(
      startDate,
      endDate,
      userId
    );

    if (occurrencesWithTask.length === 0) {
      return { tasks: [], occurrences: [], events: [] };
    }

    // Extract unique tasks
    const tasksMap = new Map<number, TaskWithRecurrence>();
    occurrencesWithTask.forEach((occ) => {
      if (occ.task && !tasksMap.has(occ.task.id)) {
        tasksMap.set(occ.task.id, occ.task as TaskWithRecurrence);
      }
    });
    const tasks = Array.from(tasksMap.values());

    // Get all events in the date range (regardless of completion status)
    const eventsWithDetails = await this.eventAdapter.getEventsWithDetailsByDateRange(
      userId,
      startDate,
      endDate
    );

    // Transform to proper types
    const occurrences: OccurrenceWithTask[] = occurrencesWithTask.map((occ) => ({
      ...occ,
      status: occ.status as TaskOccurrenceStatus,
      task: occ.task as TaskWithRecurrence,
    }));

    const events: EventWithDetails[] = eventsWithDetails.map((event) => ({
      ...event,
      dedicatedTime: event.dedicatedTime ?? 0,
      occurrence: occurrences.find((occ) => occ.id === event.associatedOccurrenceId)!,
    }));

    return {
      tasks,
      occurrences,
      events,
    };
  }
}

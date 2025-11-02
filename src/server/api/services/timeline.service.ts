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
   * Only returns completed occurrences and events
   */
  async getTimelineData(userId: string, startDate: Date, endDate: Date): Promise<TimelineData> {
    // Get all completed occurrences within the date range
    const occurrencesWithTask = await this.occurrenceAdapter.getCompletedOccurrencesByOwnerInDateRange(
      userId,
      startDate,
      endDate
    );

    if (occurrencesWithTask.length === 0) {
      return { tasks: [], occurrences: [], events: [] };
    }

    // Extract unique tasks
    const tasksMap = new Map<number, TaskWithRecurrence>();
    occurrencesWithTask.forEach(occ => {
      if (occ.task && !tasksMap.has(occ.task.id)) {
        tasksMap.set(occ.task.id, occ.task as TaskWithRecurrence);
      }
    });
    const tasks = Array.from(tasksMap.values());

    // Get occurrence IDs
    const occurrenceIds = occurrencesWithTask.map(occ => occ.id);

    // Get all completed events for these occurrences
    const eventsWithDetails = await this.eventAdapter.getCompletedEventsByOccurrenceIds(occurrenceIds);

    // Transform to proper types
    const occurrences: OccurrenceWithTask[] = occurrencesWithTask.map(occ => ({
      ...occ,
      status: occ.status as TaskOccurrenceStatus,
      task: occ.task as TaskWithRecurrence,
    }));

    const events: EventWithDetails[] = eventsWithDetails.map(event => ({
      ...event,
      dedicatedTime: event.dedicatedTime ?? 0,
      occurrence: occurrences.find(occ => occ.id === event.associatedOccurrenceId)!,
    }));

    return {
      tasks,
      occurrences,
      events,
    };
  }
}

/**
 * Fixed Task Service
 * 
 * Handles creation of fixed-time task events with calendar integration.
 * Fixed tasks have predetermined start/end times and create multiple events in advance.
 */

import type { OccurrenceAdapter, CalendarEventAdapter } from "../../adapter";
import type { DayOfWeek, CreateRecurrenceDTO } from "../types";

export class FixedTaskService {
  constructor(
    private occurrenceAdapter: OccurrenceAdapter,
    private eventAdapter: CalendarEventAdapter
  ) {}

  /**
   * Create fixed task events automatically based on recurrence pattern
   * This generates all occurrences and calendar events for fixed tasks
   */
  async createFixedTaskEvents(
    taskId: number,
    ownerId: string,
    config: {
      fixedStartTime: string;
      fixedEndTime: string;
      recurrence: CreateRecurrenceDTO;
    }
  ): Promise<void> {
    const { fixedStartTime, fixedEndTime, recurrence } = config;

    // Generate dates to create
    const datesToCreate = this.generateDates(recurrence);

    // Create occurrences and events for each date
    for (const date of datesToCreate) {
      await this.createOccurrenceAndEvent(
        taskId,
        ownerId,
        date,
        fixedStartTime,
        fixedEndTime
      );
    }
  }

  /**
   * Generate all dates based on recurrence pattern
   */
  private generateDates(recurrence: CreateRecurrenceDTO): Date[] {
    const startDate = new Date();
    const periodEnd = this.calculatePeriodEnd(startDate, recurrence);

    let datesToCreate: Date[] = [];

    // Generate based on pattern
    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      datesToCreate = this.generateDatesForDaysOfWeek(
        startDate,
        periodEnd,
        recurrence.daysOfWeek
      );
    } else if (recurrence.daysOfMonth && recurrence.daysOfMonth.length > 0) {
      datesToCreate = this.generateDatesForDaysOfMonth(
        startDate,
        periodEnd,
        recurrence.daysOfMonth
      );
    } else {
      // For tasks without specific days pattern (Fija Única, Repetitiva Fija)
      // Create N consecutive occurrences based on maxOccurrences
      const count = recurrence.maxOccurrences ?? 1;
      const interval = recurrence.interval ?? 1; // Default to 1 day between occurrences
      
      for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * interval));
        datesToCreate.push(date);
      }
    }

    // Limit to maxOccurrences if specified
    if (recurrence.maxOccurrences && datesToCreate.length > recurrence.maxOccurrences) {
      datesToCreate = datesToCreate.slice(0, recurrence.maxOccurrences);
    }

    return datesToCreate;
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(startDate: Date, recurrence: CreateRecurrenceDTO): Date {
    if (recurrence.endDate) {
      return recurrence.endDate;
    }

    const periodEnd = new Date(startDate);
    
    if (recurrence.interval) {
      periodEnd.setDate(periodEnd.getDate() + recurrence.interval);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30); // Default: 30 days
    }

    return periodEnd;
  }

  /**
   * Generate dates for all occurrences of specified days of week in a date range
   */
  private generateDatesForDaysOfWeek(
    startDate: Date,
    endDate: Date,
    daysOfWeek: DayOfWeek[]
  ): Date[] {
    const dayMap: Record<DayOfWeek, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const targetDays = daysOfWeek.map((day) => dayMap[day]);
    const dates: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      if (targetDays.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Generate dates for all occurrences of specified days of month in a date range
   */
  private generateDatesForDaysOfMonth(
    startDate: Date,
    endDate: Date,
    daysOfMonth: number[]
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      if (daysOfMonth.includes(current.getDate())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Create occurrence and calendar event for a specific date
   */
  private async createOccurrenceAndEvent(
    taskId: number,
    ownerId: string,
    date: Date,
    fixedStartTime: string,
    fixedEndTime: string
  ): Promise<void> {
    // Create occurrence
    const occurrence = await this.occurrenceAdapter.createOccurrence({
      associatedTaskId: taskId,
      startDate: date,
      targetDate: date,
      limitDate: date,
    });

    // Parse time strings
    const [startHours, startMinutes, startSeconds] = fixedStartTime.split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = fixedEndTime.split(':').map(Number);

    // Create calendar event with fixed times
    const eventStart = new Date(date);
    eventStart.setHours(startHours!, startMinutes, startSeconds);

    const eventEnd = new Date(date);
    eventEnd.setHours(endHours!, endMinutes, endSeconds);

    await this.eventAdapter.createEvent(ownerId, {
      associatedOccurrenceId: occurrence.id,
      isFixed: true,
      start: eventStart,
      finish: eventEnd,
    });
  }
}

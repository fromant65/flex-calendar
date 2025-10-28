/**
 * Backlog Detection Service
 * 
 * Handles detection and management of backlog occurrences.
 * Provides functionality to identify and skip old pending occurrences.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { OccurrenceAdapter, TaskAdapter } from "../../adapter";

export class BacklogDetectionService {
  private occurrenceAdapter: OccurrenceAdapter;
  private taskAdapter: TaskAdapter;

  constructor() {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.taskAdapter = new TaskAdapter();
  }

  /**
   * Detect and optionally skip backlog occurrences
   * Returns information about pending occurrences
   */
  async detectBacklog(taskId: number): Promise<{
    hasSevereBacklog: boolean;
    pendingCount: number;
    oldestPendingDate: Date | null;
    estimatedBacklogCount: number;
    pendingOccurrences: Array<{ id: number; startDate: Date; status: string }>;
  }> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task || !task.recurrence) {
      return {
        hasSevereBacklog: false,
        pendingCount: 0,
        oldestPendingDate: null,
        estimatedBacklogCount: 0,
        pendingOccurrences: [],
      };
    }

    // Get all pending/in-progress occurrences for this task
    const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const pendingOccurrences = allOccurrences
      .filter(occ => occ.status === "Pending" || occ.status === "InProgress")
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (pendingOccurrences.length === 0) {
      return {
        hasSevereBacklog: false,
        pendingCount: 0,
        oldestPendingDate: null,
        estimatedBacklogCount: 0,
        pendingOccurrences: [],
      };
    }

    const oldestPending = pendingOccurrences[0]!;
    const now = new Date();

    // Calculate how many occurrences should have been generated based on recurrence pattern
    let estimatedCount = 0;
    if (task.recurrence.interval) {
      const daysSinceOldest = Math.floor(
        (now.getTime() - oldestPending.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const periodsPassed = Math.floor(daysSinceOldest / task.recurrence.interval);
      
      if (task.recurrence.maxOccurrences) {
        estimatedCount = periodsPassed * task.recurrence.maxOccurrences;
      } else {
        estimatedCount = periodsPassed;
      }
    } else if (task.recurrence.daysOfWeek) {
      estimatedCount = this.countOccurrencesBetweenDates(
        oldestPending.startDate,
        now,
        task.recurrence.daysOfWeek
      );
    } else if (task.recurrence.daysOfMonth) {
      estimatedCount = this.countMonthlyOccurrencesBetweenDates(
        oldestPending.startDate,
        now,
        task.recurrence.daysOfMonth
      );
    }

    const hasSevereBacklog = pendingOccurrences.length > 5;

    return {
      hasSevereBacklog,
      pendingCount: pendingOccurrences.length,
      oldestPendingDate: oldestPending.startDate,
      estimatedBacklogCount: estimatedCount,
      pendingOccurrences: pendingOccurrences.map(occ => ({
        id: occ.id,
        startDate: occ.startDate,
        status: occ.status,
      })),
    };
  }

  /**
   * Skip all backlog occurrences except the most recent one
   * Returns the number of occurrences skipped
   */
  async skipBacklogOccurrences(
    taskId: number,
    skipOccurrenceFn: (occurrenceId: number) => Promise<boolean>
  ): Promise<number> {
    const backlogInfo = await this.detectBacklog(taskId);
    
    if (!backlogInfo.hasSevereBacklog || backlogInfo.pendingOccurrences.length <= 1) {
      return 0;
    }

    // Skip all except the last (most recent) one
    const toSkip = backlogInfo.pendingOccurrences.slice(0, -1);
    
    for (const occ of toSkip) {
      await skipOccurrenceFn(occ.id);
    }

    return toSkip.length;
  }

  /**
   * Helper: Count how many occurrences of specific days of week exist between two dates
   */
  private countOccurrencesBetweenDates(
    startDate: Date,
    endDate: Date,
    daysOfWeek: string[]
  ): number {
    const dayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };

    const targetDays = daysOfWeek.map(day => dayMap[day]).filter(d => d !== undefined);
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      if (targetDays.includes(current.getDay())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Helper: Count how many occurrences of specific days of month exist between two dates
   */
  private countMonthlyOccurrencesBetweenDates(
    startDate: Date,
    endDate: Date,
    daysOfMonth: number[]
  ): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      if (daysOfMonth.includes(current.getDate())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

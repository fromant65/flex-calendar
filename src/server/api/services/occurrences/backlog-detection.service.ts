/**
 * Backlog Detection Service
 * 
 * Handles detection and management of backlog occurrences.
 * Provides functionality to identify and skip old pending occurrences.
 * Extracted from TaskLifecycleService for better modularity.
 */

import { OccurrenceAdapter, TaskAdapter } from "../../adapter";
import { RecurrenceDateCalculator } from "../scheduling/recurrence-date-calculator.service";

export class BacklogDetectionService {
  private occurrenceAdapter: OccurrenceAdapter;
  private taskAdapter: TaskAdapter;
  private dateCalculator: RecurrenceDateCalculator;

  constructor() {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.taskAdapter = new TaskAdapter();
    this.dateCalculator = new RecurrenceDateCalculator();
  }

  /**
   * Detect and optionally skip backlog occurrences
   * Returns information about pending occurrences and estimates missing ones
   * Now properly detects backlog based on overdue occurrences, not just count
   */
  async detectBacklog(taskId: number): Promise<{
    hasSevereBacklog: boolean;
    pendingCount: number;
    oldestPendingDate: Date | null;
    estimatedBacklogCount: number;
    pendingOccurrences: Array<{ id: number; startDate: Date; status: string }>;
    overdueCount: number;
    estimatedMissingCount: number;
  }> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task?.recurrence) {
      return {
        hasSevereBacklog: false,
        pendingCount: 0,
        oldestPendingDate: null,
        estimatedBacklogCount: 0,
        pendingOccurrences: [],
        overdueCount: 0,
        estimatedMissingCount: 0,
      };
    }

    const now = new Date();
    
    // Get all occurrences for this task, sorted by startDate
    const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const sortedOccurrences = allOccurrences.sort((a, b) => 
      a.startDate.getTime() - b.startDate.getTime()
    );

    // Filter pending/in-progress occurrences
    const pendingOccurrences = sortedOccurrences
      .filter(occ => occ.status === "Pending" || occ.status === "InProgress")
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Calculate estimated missing occurrences
    // Simply check: what should the next occurrence date be, and how many fit until today?
    let estimatedMissingCount = 0;
    const lastOccurrence = sortedOccurrences[sortedOccurrences.length - 1];
    
    if (lastOccurrence) {
      let currentDate = new Date(lastOccurrence.startDate);
      
      // Calculate how many occurrences should exist after the last one until today
      while (currentDate < now) {
        currentDate = this.dateCalculator.calculateNextOccurrenceDate(currentDate, task.recurrence);
        if (currentDate <= now) {
          estimatedMissingCount++;
        }
      }
    }

    // Total estimated backlog is existing pending + missing occurrences
    const totalEstimatedBacklog = pendingOccurrences.length + estimatedMissingCount;
    
    // Count overdue occurrences (those whose limitDate has passed)
    const overdueCount = pendingOccurrences.filter(occ => 
      occ.limitDate && occ.limitDate < now
    ).length;

    // IMPROVED: Detect backlog if there are ANY overdue occurrences OR missing occurrences
    // Not just based on high count
    const hasSevereBacklog = overdueCount > 0 || estimatedMissingCount > 0;

    return {
      hasSevereBacklog,
      pendingCount: pendingOccurrences.length,
      oldestPendingDate: pendingOccurrences[0]?.startDate ?? null,
      estimatedBacklogCount: totalEstimatedBacklog,
      pendingOccurrences: pendingOccurrences.map(occ => ({
        id: occ.id,
        startDate: occ.startDate,
        status: occ.status,
      })),
      overdueCount,
      estimatedMissingCount,
    };
  }

  /**
   * Skip all backlog occurrences that are overdue
   * Also generates missing occurrences up to today
   * Returns the number of occurrences skipped and created
   */
  async skipBacklogOccurrences(
    taskId: number,
    skipOccurrenceFn: (occurrenceId: number) => Promise<boolean>,
    createOccurrenceFn: () => Promise<void>
  ): Promise<{ skippedCount: number; createdCount: number }> {
    const task = await this.taskAdapter.getTaskWithRecurrence(taskId);
    if (!task?.recurrence) {
      return { skippedCount: 0, createdCount: 0 };
    }

    const now = new Date();
    let createdCount = 0;
    let skippedCount = 0;

    // Step 1: Generate all missing occurrences until today
    // Keep generating until the latest occurrence's startDate is >= today
    let shouldContinue = true;
    const maxIterations = 1000; // Safety limit to prevent infinite loops
    let iterations = 0;
    
    while (shouldContinue && iterations < maxIterations) {
      iterations++;
      
      // Get current occurrences
      const allOccurrences = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
      const sortedOccurrences = allOccurrences.sort((a, b) => 
        a.startDate.getTime() - b.startDate.getTime()
      );
      
      const lastOccurrence = sortedOccurrences[sortedOccurrences.length - 1];
      
      // Calculate what the next occurrence date would be
      const nextDate = this.dateCalculator.calculateNextOccurrenceDate(
        lastOccurrence?.startDate ?? new Date(),
        task.recurrence
      );

      // Only create if the next occurrence should start before or on today
      if (nextDate <= now) {
        try {
          await createOccurrenceFn();
          createdCount++;
        } catch (error) {
          console.error("Error creating occurrence during backlog processing:", error);
          shouldContinue = false;
        }
      } else {
        shouldContinue = false;
      }
    }

    if (iterations >= maxIterations) {
      console.warn(`Reached max iterations (${maxIterations}) when processing backlog for task ${taskId}`);
    }

    // Step 2: Skip all overdue occurrences, keeping only the most recent one
    // Get fresh list of all occurrences after creation
    const allOccurrencesAfterCreation = await this.occurrenceAdapter.getOccurrencesByTaskId(taskId);
    const pendingAfterCreation = allOccurrencesAfterCreation
      .filter(occ => occ.status === "Pending" || occ.status === "InProgress")
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Skip all occurrences whose limitDate has passed, except keep the most recent one
    for (let i = 0; i < pendingAfterCreation.length - 1; i++) {
      const occ = pendingAfterCreation[i]!;
      
      // Skip if limitDate has passed
      if (occ.limitDate && occ.limitDate < now) {
        try {
          await skipOccurrenceFn(occ.id);
          skippedCount++;
        } catch (error) {
          console.error(`Error skipping occurrence ${occ.id}:`, error);
        }
      }
    }

    return { skippedCount, createdCount };
  }
}

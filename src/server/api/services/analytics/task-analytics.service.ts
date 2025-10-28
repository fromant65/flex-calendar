/**
 * Task Analytics Service - handles urgency calculation and statistics
 */

import type {
  TaskStatistics,
  TaskOccurrence,
} from "../types";
import { UrgencyCalculator } from "../../utils/urgency-calculator";
import { OccurrenceAdapter } from "../../adapter";
import { TaskRepository, TaskOccurrenceRepository } from "../../repository";

export class TaskAnalyticsService {
  private occurrenceAdapter: OccurrenceAdapter;
  private taskRepo: TaskRepository;
  private occurrenceRepo: TaskOccurrenceRepository;

  constructor() {
    this.occurrenceAdapter = new OccurrenceAdapter();
    this.taskRepo = new TaskRepository();
    this.occurrenceRepo = new TaskOccurrenceRepository();
  }

  /**
   * Calculate and add urgency to an occurrence (no DB update)
   */
  enrichOccurrenceWithUrgency<T extends { createdAt: Date; targetDate: Date | null; limitDate: Date | null }>(
    occurrence: T
  ): T & { urgency: number } {
    const result = UrgencyCalculator.calculateUrgency({
      currentDate: new Date(),
      creationDate: occurrence.createdAt,
      targetDate: occurrence.targetDate ?? undefined,
      limitDate: occurrence.limitDate ?? undefined,
    });

    return {
      ...occurrence,
      urgency: result.urgency,
    };
  }

  /**
   * Calculate and add urgency to multiple occurrences (no DB update)
   */
  enrichOccurrencesWithUrgency<T extends { createdAt: Date; targetDate: Date | null; limitDate: Date | null }>(
    occurrences: T[]
  ): Array<T & { urgency: number }> {
    return occurrences.map(occ => this.enrichOccurrenceWithUrgency(occ));
  }


  /**
   * Get statistics for a user's tasks
   */
  async getUserStatistics(userId: string): Promise<TaskStatistics> {
    const tasks = await this.taskRepo.findByOwnerId(userId);
    const activeTasks = tasks.filter((t) => t.isActive);

    // Get all occurrences for user's tasks
    const taskIds = tasks.map((t) => t.id);
    const allOccurrences = await Promise.all(
      taskIds.map((id) => this.occurrenceRepo.findByTaskId(id))
    );
    const occurrences = allOccurrences.flat();

    const completedOccurrences = occurrences.filter((o) => o.status === "Completed");
    const pendingOccurrences = occurrences.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    );

    const totalTimeSpent = occurrences.reduce(
      (sum, o) => sum + (o.timeConsumed ?? 0),
      0
    );

    const averageCompletionRate =
      occurrences.length > 0
        ? (completedOccurrences.length / occurrences.length) * 100
        : 0;

    return {
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      completedOccurrences: completedOccurrences.length,
      pendingOccurrences: pendingOccurrences.length,
      totalTimeSpent,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
    };
  }

  /**
   * Get occurrences sorted by urgency
   */
  async getOccurrencesByUrgency(userId: string) {
    // Use the adapter to get occurrences with task details
    const occurrencesWithTask = await this.occurrenceAdapter.getOccurrencesWithTaskByUserId(userId);
    
    // Filter only pending/in-progress occurrences
    const activeOccurrences = occurrencesWithTask.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    );
    
    // Enrich with urgency
    const enrichedOccurrences = this.enrichOccurrencesWithUrgency(activeOccurrences);
    
    // Filter by urgency > 5
    const urgentOccurrences = enrichedOccurrences.filter(
      (o) => (o.urgency ?? 0) > 5
    );
    
    // Sort by urgency (descending)
    return urgentOccurrences.sort((a, b) => (b.urgency ?? 0) - (a.urgency ?? 0));
  }

  /**
   * Get occurrences sorted by importance
   */
  async getOccurrencesByImportance(userId: string) {
    // Use the adapter to get occurrences with task details
    const occurrencesWithTask = await this.occurrenceAdapter.getOccurrencesWithTaskByUserId(userId);
    
    // Filter only pending/in-progress occurrences
    const activeOccurrences = occurrencesWithTask.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    );
    
    // Enrich with urgency
    const enrichedOccurrences = this.enrichOccurrencesWithUrgency(activeOccurrences);
    
    // Filter by importance > 5
    const importantOccurrences = enrichedOccurrences.filter(
      (o) => (o.task?.importance ?? 0) > 5
    );
    
    // Sort by importance (descending), then by urgency
    return importantOccurrences.sort((a, b) => {
      const importanceDiff = (b.task?.importance ?? 0) - (a.task?.importance ?? 0);
      if (importanceDiff !== 0) return importanceDiff;
      return (b.urgency ?? 0) - (a.urgency ?? 0);
    });
  }
}

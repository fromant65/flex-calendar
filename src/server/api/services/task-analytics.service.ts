/**
 * Task Analytics Service - handles urgency calculation and statistics
 */

import type {
  UrgencyCalculationInput,
  UrgencyCalculationResult,
  TaskStatistics,
} from "./types";
import { OccurrenceAdapter } from "../adapter";
import { TaskRepository, TaskOccurrenceRepository } from "../repository";

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
   * Calculate urgency for a task occurrence
   * 
   * Algorithm:
   * - Urgency 0-5: Before target date (based on progress: time elapsed / time remaining)
   * - Urgency 5-10: Between target and limit date
   * - Urgency > 10: Past limit date (overdue)
   */
  calculateUrgency(input: UrgencyCalculationInput): UrgencyCalculationResult {
    const { currentDate, creationDate, targetDate, limitDate } = input;
    
    // If no dates are set, urgency is minimal
    if (!targetDate && !limitDate) {
      return {
        urgency: 0,
        isOverdue: false,
      };
    }

    const now = currentDate.getTime();
    const created = creationDate.getTime();
    const target = targetDate?.getTime();
    const limit = limitDate?.getTime();

    // Calculate days until dates
    const daysUntilTarget = target
      ? Math.floor((target - now) / (1000 * 60 * 60 * 24))
      : undefined;
    const daysUntilLimit = limit
      ? Math.floor((limit - now) / (1000 * 60 * 60 * 24))
      : undefined;

    let urgency = 0;
    let isOverdue = false;

    // Case 1: Past limit date - OVERDUE
    if (limit && now > limit) {
      const daysOverdue = Math.abs(daysUntilLimit ?? 0);
      urgency = 10 + Math.min(daysOverdue * 0.5, 10); // Max urgency of 20
      isOverdue = true;
    }
    // Case 2: Between target and limit
    else if (target && limit && now >= target && now <= limit) {
      const totalRange = limit - target;
      const elapsed = now - target;
      const progress = totalRange > 0 ? elapsed / totalRange : 1;
      urgency = 5 + progress * 5; // Range 5-10
    }
    // Case 3: Before target date
    else if (target && now < target) {
      const timeElapsed = now - created;
      const timeRemaining = target - now;
      
      // Evitar división por cero
      if (timeRemaining <= 0) {
        urgency = 5;
      } else if (timeElapsed < 0) {
        // Si la fecha actual es antes de la creación, urgencia mínima
        urgency = 0;
      } else {
        // urgency = 5 * (timeElapsed / timeRemaining)
        // A medida que nos acercamos al target, timeRemaining disminuye y urgency aumenta
        urgency = Math.min(5, 5 * (timeElapsed / timeRemaining));
      }
    }
    // Case 4: Only limit date exists and we're before it
    else if (limit && now < limit) {
      const timeElapsed = now - created;
      const timeRemaining = limit - now;
      
      // Evitar división por cero
      if (timeRemaining <= 0) {
        urgency = 10;
      } else if (timeElapsed < 0) {
        urgency = 0;
      } else {
        // Similar al caso 3, pero escalado a 10 en lugar de 5
        urgency = Math.min(10, 10 * (timeElapsed / timeRemaining));
      }
    }

    return {
      urgency: Math.round(urgency * 100) / 100, // Round to 2 decimals
      isOverdue,
      daysUntilTarget,
      daysUntilLimit,
    };
  }

  /**
   * Update urgency for a specific occurrence
   */
  async updateOccurrenceUrgency(occurrenceId: number): Promise<void> {
    const occurrence = await this.occurrenceAdapter.getOccurrenceById(occurrenceId);
    if (!occurrence) return;

    const result = this.calculateUrgency({
      currentDate: new Date(),
      creationDate: occurrence.createdAt,
      targetDate: occurrence.targetDate ?? undefined,
      limitDate: occurrence.limitDate ?? undefined,
    });

    await this.occurrenceAdapter.updateUrgency(occurrenceId, result.urgency);
  }

  /**
   * Update urgency for all pending/in-progress occurrences of a task
   */
  async updateTaskOccurrencesUrgency(taskId: number): Promise<void> {
    const activeOccurrences = await this.occurrenceAdapter.getActiveOccurrencesByTaskId(taskId);

    for (const occurrence of activeOccurrences) {
      await this.updateOccurrenceUrgency(occurrence.id);
    }
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
    const tasks = await this.taskRepo.findByOwnerId(userId);
    const taskIds = tasks.map((t) => t.id);
    
    const allOccurrences = await Promise.all(
      taskIds.map((id) => this.occurrenceRepo.findByTaskId(id))
    );
    const occurrences = allOccurrences.flat();

    // Filter active occurrences and sort by urgency (descending)
    return occurrences
      .filter((o) => o.status === "Pending" || o.status === "In Progress")
      .sort((a, b) => (b.urgency ?? 0) - (a.urgency ?? 0));
  }
}

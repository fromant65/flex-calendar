/**
 * Task Analytics Service - handles urgency calculation and statistics
 */

import type {
  UrgencyCalculationInput,
  UrgencyCalculationResult,
  TaskStatistics,
  TaskOccurrence,
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
      } else if (timeElapsed <= 0) {
        // Si acabamos de crear la tarea, urgencia mínima pero no cero
        // Usar una pequeña fracción basada en el tiempo total disponible
        const totalTime = target - created;
        urgency = totalTime > 0 ? 0.5 : 1; // Mínimo 0.5, máximo 1
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
      } else if (timeElapsed <= 0) {
        // Si acabamos de crear la tarea, urgencia mínima pero no cero
        const totalTime = limit - created;
        urgency = totalTime > 0 ? 0.5 : 1; // Mínimo 0.5, máximo 1
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
   * Calculate and add urgency to an occurrence (no DB update)
   */
  enrichOccurrenceWithUrgency<T extends { createdAt: Date; targetDate: Date | null; limitDate: Date | null }>(
    occurrence: T
  ): T & { urgency: number } {
    const result = this.calculateUrgency({
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

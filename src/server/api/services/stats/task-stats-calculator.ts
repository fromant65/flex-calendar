/**
 * Task Stats Calculator - Handles task-related statistics calculations
 */

import type { TaskStatsData, ImportanceDistribution } from "~/types";
import type { StatsDataset, StatsTask, StatsOccurrence } from "./stats-types";
import { TaskStatsInsightsGenerator } from "./insights-generators";

export class TaskStatsCalculator {
  /**
   * Calculate all task statistics
   */
  calculate(dataset: StatsDataset): TaskStatsData {
    try {
      const { tasks: userTasks = [], occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences)) {
        console.error("[TaskStats] Invalid data structure:", {
          tasksIsArray: Array.isArray(userTasks),
          occurrencesIsArray: Array.isArray(occurrences),
        });
        return this.getDefaultStats();
      }

      console.log(
        `[TaskStats] Calculating stats for ${userTasks.length} tasks and ${occurrences.length} occurrences`
      );

      const stats: TaskStatsData = {
        averageCompletionTime: this.calculateAverageCompletionTime(userTasks),
        importanceDistribution: this.calculateImportanceDistribution(userTasks, occurrences),
        fixedVsFlexible: this.calculateFixedVsFlexible(userTasks),
        recurringVsUnique: this.calculateRecurringVsUnique(userTasks),
      };

      // Generate insights
      stats.insights = TaskStatsInsightsGenerator.generate(stats);

      console.log("[TaskStats] Calculation completed successfully");
      return stats;
    } catch (error) {
      console.error("[TaskStats] Error calculating task stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate average time from task creation to completion
   */
  private calculateAverageCompletionTime(userTasks: StatsTask[]): number | null {
    // Filter tasks that have both completedAt and createdAt
    const completedTasks = userTasks.filter(
      (t) => t?.completedAt && t?.createdAt
    );
    
    if (completedTasks.length === 0) {
      console.log("[TaskStats] No completed tasks with valid dates found");
      return null;
    }

    let validDurations = 0;
    let totalHours = 0;

    for (const task of completedTasks) {
      try {
        // completedAt is guaranteed to exist due to filter, but TypeScript needs non-null assertion
        const completed = new Date(task.completedAt!);
        const created = new Date(task.createdAt);
        
        // Validate dates
        if (isNaN(completed.getTime()) || isNaN(created.getTime())) {
          console.warn(`[TaskStats] Invalid date for task ${task.id}:`, {
            completedAt: task.completedAt,
            createdAt: task.createdAt,
          });
          continue;
        }

        const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        
        // Only count positive durations (completed after created)
        if (hours > 0) {
          totalHours += hours;
          validDurations++;
        } else {
          console.warn(
            `[TaskStats] Negative or zero duration for task ${task.id}: ${hours} hours`
          );
        }
      } catch (error) {
        console.error(`[TaskStats] Error processing task ${task.id}:`, error);
        continue;
      }
    }

    if (validDurations === 0) {
      console.warn("[TaskStats] No valid durations found after processing");
      return null;
    }

    const average = totalHours / validDurations;
    console.log(
      `[TaskStats] Calculated average completion time: ${average.toFixed(2)} hours from ${validDurations} tasks`
    );
    return average;
  }

  /**
   * Calculate importance distribution across occurrences
   */
  private calculateImportanceDistribution(
    userTasks: StatsTask[],
    occurrences: StatsOccurrence[]
  ): ImportanceDistribution[] {
    const importanceGroups = new Map<number, { total: number; completed: number }>();

    // Filter valid occurrences
    const validOccurrences = occurrences.filter(
      (occ) => occ?.associatedTaskId && occ?.status
    );

    if (validOccurrences.length === 0) {
      console.log("[TaskStats] No valid occurrences found for importance distribution");
      return [];
    }

    for (const occ of validOccurrences) {
      const task = userTasks.find((t) => t?.id === occ.associatedTaskId);
      if (!task) {
        console.warn(
          `[TaskStats] Task not found for occurrence ${occ.id} with taskId ${occ.associatedTaskId}`
        );
        continue;
      }

      // Ensure importance is within valid range (1-10)
      let importance = task.importance ?? 5;
      if (typeof importance !== "number" || importance < 1 || importance > 10) {
        console.warn(
          `[TaskStats] Invalid importance value ${importance} for task ${task.id}, defaulting to 5`
        );
        importance = 5;
      }

      if (!importanceGroups.has(importance)) {
        importanceGroups.set(importance, { total: 0, completed: 0 });
      }
      const group = importanceGroups.get(importance)!;
      group.total++;
      if (occ.status === "Completed") {
        group.completed++;
      }
    }

    const distribution = Array.from(importanceGroups.entries())
      .map(([importance, data]) => ({
        importance,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        totalOccurrences: data.total,
        completedOccurrences: data.completed,
      }))
      .sort((a, b) => a.importance - b.importance);

    console.log(
      `[TaskStats] Calculated importance distribution for ${distribution.length} importance levels`
    );
    return distribution;
  }

  /**
   * Calculate fixed vs flexible tasks distribution
   */
  private calculateFixedVsFlexible(userTasks: StatsTask[]): { fixed: number; flexible: number } {
    const fixedCount = userTasks.filter((t) => t?.isFixed === true).length;
    const flexibleCount = userTasks.filter((t) => t?.isFixed === false).length;

    return {
      fixed: fixedCount,
      flexible: flexibleCount,
    };
  }

  /**
   * Calculate recurring vs unique tasks distribution
   */
  private calculateRecurringVsUnique(userTasks: StatsTask[]): { recurring: number; unique: number } {
    const recurringCount = userTasks.filter(
      (t) => t?.recurrenceId !== null && t?.recurrenceId !== undefined
    ).length;
    const uniqueCount = userTasks.filter(
      (t) => t?.recurrenceId === null || t?.recurrenceId === undefined
    ).length;

    return {
      recurring: recurringCount,
      unique: uniqueCount,
    };
  }

  /**
   * Get default stats when data is unavailable
   */
  private getDefaultStats(): TaskStatsData {
    return {
      averageCompletionTime: null,
      importanceDistribution: [],
      fixedVsFlexible: { fixed: 0, flexible: 0 },
      recurringVsUnique: { recurring: 0, unique: 0 },
    };
  }
}

/**
 * Task Stats Calculator - Handles task-related statistics calculations
 */

import type { TaskStatsData, ImportanceDistribution } from "~/types";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class TaskStatsCalculator {
  /**
   * Calculate all task statistics
   */
  calculate(dataset: UserDataset): TaskStatsData {
    try {
      const { tasks: userTasks = [], occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences)) {
        console.warn("Invalid data structure in calculateTaskStats");
        return this.getDefaultStats();
      }

      return {
        averageCompletionTime: this.calculateAverageCompletionTime(userTasks),
        importanceDistribution: this.calculateImportanceDistribution(userTasks, occurrences),
        fixedVsFlexible: this.calculateFixedVsFlexible(userTasks),
        recurringVsUnique: this.calculateRecurringVsUnique(userTasks),
      };
    } catch (error) {
      console.error("Error calculating task stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate average time from task creation to completion
   */
  private calculateAverageCompletionTime(userTasks: any[]): number | null {
    const completedTasks = userTasks.filter((t) => t?.completedAt);
    
    if (completedTasks.length === 0) return null;

    const totalHours = completedTasks.reduce((sum, t) => {
      try {
        const completed = new Date(t.completedAt!);
        const created = new Date(t.createdAt);
        if (isNaN(completed.getTime()) || isNaN(created.getTime())) {
          return sum;
        }
        const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + (hours > 0 ? hours : 0);
      } catch {
        return sum;
      }
    }, 0);

    return totalHours / completedTasks.length;
  }

  /**
   * Calculate importance distribution across occurrences
   */
  private calculateImportanceDistribution(
    userTasks: any[],
    occurrences: any[]
  ): ImportanceDistribution[] {
    const importanceGroups = new Map<number, { total: number; completed: number }>();

    for (const occ of occurrences) {
      if (!occ?.associatedTaskId) continue;

      const task = userTasks.find((t) => t?.id === occ.associatedTaskId);
      if (!task) continue;

      const importance = task.importance ?? 1;
      if (!importanceGroups.has(importance)) {
        importanceGroups.set(importance, { total: 0, completed: 0 });
      }
      const group = importanceGroups.get(importance)!;
      group.total++;
      if (occ.status === "Completed") {
        group.completed++;
      }
    }

    return Array.from(importanceGroups.entries())
      .map(([importance, data]) => ({
        importance,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        totalOccurrences: data.total,
        completedOccurrences: data.completed,
      }))
      .sort((a, b) => a.importance - b.importance);
  }

  /**
   * Calculate fixed vs flexible tasks distribution
   */
  private calculateFixedVsFlexible(userTasks: any[]): { fixed: number; flexible: number } {
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
  private calculateRecurringVsUnique(userTasks: any[]): { recurring: number; unique: number } {
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

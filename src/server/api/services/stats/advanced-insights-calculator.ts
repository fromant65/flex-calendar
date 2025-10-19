/**
 * Advanced Insights Calculator - Handles advanced analytics and insights
 */

import type { AdvancedInsights, LowComplianceHabit, TrendPoint, Bottleneck } from "~/types";
import { StatsUtils } from "./stats-utils";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class AdvancedInsightsCalculator {
  /**
   * Calculate all advanced insights
   */
  calculate(dataset: UserDataset): AdvancedInsights {
    try {
      const { tasks: userTasks = [], occurrences = [], recurrenceMap } = dataset;

      return {
        lowComplianceHabits: this.calculateLowComplianceHabits(
          userTasks,
          occurrences,
          recurrenceMap
        ),
        completionTrend: this.calculateCompletionTrend(occurrences),
        recurringVsUniqueComparison: this.calculateRecurringVsUniqueComparison(
          userTasks,
          occurrences
        ),
        bottlenecks: this.calculateBottlenecks(userTasks, occurrences),
      };
    } catch (error) {
      console.error("Error calculating advanced insights:", error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Identify habits with low completion rates
   */
  private calculateLowComplianceHabits(
    userTasks: any[],
    occurrences: any[],
    recurrenceMap: Map<number, any>
  ): LowComplianceHabit[] {
    // Filter habits (tasks with recurrence and no maxOccurrences or maxOccurrences > 10)
    const habitTasks = userTasks.filter((t) => {
      if (!t?.recurrenceId) return false;
      const rec = recurrenceMap.get(t.recurrenceId);
      return rec && (!rec.maxOccurrences || rec.maxOccurrences > 10);
    });

    return habitTasks
      .map((task) => {
        const taskOccs = occurrences.filter((o) => o?.associatedTaskId === task.id);
        const completed = taskOccs.filter((o) => o?.status === "Completed").length;
        const completionRate = taskOccs.length > 0 ? (completed / taskOccs.length) * 100 : 0;

        return {
          taskId: task.id,
          taskName: task.name,
          completionRate,
          totalOccurrences: taskOccs.length,
          completedOccurrences: completed,
        };
      })
      .filter((h) => h.completionRate < 70 && h.totalOccurrences >= 5)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);
  }

  /**
   * Calculate completion trend over time (by week)
   */
  private calculateCompletionTrend(occurrences: any[]): TrendPoint[] {
    const trendByWeek = new Map<string, { completed: number; total: number }>();

    for (const occ of occurrences) {
      if (!occ?.startDate) continue;

      try {
        const date = new Date(occ.startDate);
        if (isNaN(date.getTime())) continue;

        const weekKey = StatsUtils.getWeekKey(date);

        if (!trendByWeek.has(weekKey)) {
          trendByWeek.set(weekKey, { completed: 0, total: 0 });
        }
        const week = trendByWeek.get(weekKey)!;
        week.total++;
        if (occ.status === "Completed") {
          week.completed++;
        }
      } catch (error) {
        continue;
      }
    }

    return Array.from(trendByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 weeks
      .map(([period, data]) => ({
        period,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));
  }

  /**
   * Compare recurring vs unique task completion rates
   */
  private calculateRecurringVsUniqueComparison(userTasks: any[], occurrences: any[]) {
    const recurringTaskIds = new Set(
      userTasks.filter((t) => t?.recurrenceId).map((t) => t.id)
    );
    const recurringOccs = occurrences.filter((o) =>
      o?.associatedTaskId ? recurringTaskIds.has(o.associatedTaskId) : false
    );
    const uniqueOccs = occurrences.filter((o) =>
      o?.associatedTaskId ? !recurringTaskIds.has(o.associatedTaskId) : false
    );

    const recurringCompletionRate =
      recurringOccs.length > 0
        ? (recurringOccs.filter((o) => o?.status === "Completed").length / recurringOccs.length) *
          100
        : 0;
    const uniqueCompletionRate =
      uniqueOccs.length > 0
        ? (uniqueOccs.filter((o) => o?.status === "Completed").length / uniqueOccs.length) * 100
        : 0;

    return {
      recurringCompletionRate,
      uniqueCompletionRate,
    };
  }

  /**
   * Identify tasks with high pending or skipped occurrences
   */
  private calculateBottlenecks(userTasks: any[], occurrences: any[]): Bottleneck[] {
    const taskOccurrenceMap = new Map<number, any[]>();

    for (const occ of occurrences) {
      if (!occ?.associatedTaskId) continue;

      if (!taskOccurrenceMap.has(occ.associatedTaskId)) {
        taskOccurrenceMap.set(occ.associatedTaskId, []);
      }
      taskOccurrenceMap.get(occ.associatedTaskId)!.push(occ);
    }

    return Array.from(taskOccurrenceMap.entries())
      .map(([taskId, occs]) => {
        const task = userTasks.find((t) => t?.id === taskId);
        if (!task) return null;

        const pending = occs.filter((o) => o?.status === "Pending").length;
        const skipped = occs.filter((o) => o?.status === "Skipped").length;

        return {
          taskId,
          taskName: task.name,
          pendingCount: pending,
          skippedCount: skipped,
          totalCount: occs.length,
        };
      })
      .filter((b): b is Bottleneck => b !== null && (b.pendingCount > 3 || b.skippedCount > 2))
      .sort((a, b) => b.pendingCount + b.skippedCount - (a.pendingCount + a.skippedCount))
      .slice(0, 5);
  }

  /**
   * Get default insights when data is unavailable
   */
  private getDefaultInsights(): AdvancedInsights {
    return {
      lowComplianceHabits: [],
      completionTrend: [],
      recurringVsUniqueComparison: {
        recurringCompletionRate: 0,
        uniqueCompletionRate: 0,
      },
      bottlenecks: [],
    };
  }
}

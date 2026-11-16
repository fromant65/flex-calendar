/**
 * Advanced Insights Calculator - Handles advanced analytics and insights
 */

import type { AdvancedInsights, LowComplianceHabit, TrendPoint, Bottleneck } from "~/types";
import type { StatsDataset, StatsTask, StatsOccurrence } from "./stats-types";
import { StatsUtils } from "./stats-utils";
import { AdvancedInsightsGenerator } from "./insights-generators";

export class AdvancedInsightsCalculator {
  /**
   * Calculate all advanced insights
   */
  calculate(dataset: StatsDataset): AdvancedInsights {
    try {
      const { tasks: userTasks = [], occurrences = [] } = dataset;

      const insights: AdvancedInsights = {
        lowComplianceHabits: this.calculateLowComplianceHabits(
          userTasks,
          occurrences
        ),
        completionTrend: this.calculateCompletionTrend(occurrences),
        recurringVsUniqueComparison: this.calculateRecurringVsUniqueComparison(
          userTasks,
          occurrences
        ),
        bottlenecks: this.calculateBottlenecks(userTasks, occurrences),
      };

      // Generate insights
      insights.insights = AdvancedInsightsGenerator.generate(insights);

      return insights;
    } catch (error) {
      console.error("[AdvancedInsights] Error calculating advanced insights:", error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Identify habits with low completion rates
   */
  private calculateLowComplianceHabits(
    userTasks: StatsTask[],
    occurrences: StatsOccurrence[]
  ): LowComplianceHabit[] {
    // In V2 we infer habits by repeated occurrences for the same task.
    const habitTasks = userTasks.filter((t) => occurrences.filter((o) => o.taskId === t.id).length > 1);

    return habitTasks
      .map((task) => {
        const taskOccs = occurrences.filter((o) => o?.taskId === task.id);
        const completed = taskOccs.filter((o) => o?.status === "completed").length;
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
  private calculateCompletionTrend(occurrences: StatsOccurrence[]): TrendPoint[] {
    const trendByWeek = new Map<string, { completed: number; total: number }>();
    let invalidDates = 0;

    for (const occ of occurrences) {
      if (!occ?.slotStartAt && !occ?.createdAt) {
        invalidDates++;
        continue;
      }

      try {
        const date = new Date(occ.slotStartAt ?? occ.createdAt);
        if (isNaN(date.getTime())) {
          invalidDates++;
          continue;
        }

        const weekKey = StatsUtils.getWeekKey(date);

        if (!trendByWeek.has(weekKey)) {
          trendByWeek.set(weekKey, { completed: 0, total: 0 });
        }
        const week = trendByWeek.get(weekKey)!;
        week.total++;
        if (occ.status === "completed") {
          week.completed++;
        }
      } catch (error) {
        invalidDates++;
        continue;
      }
    }

    if (invalidDates > 0) {
      console.warn(`[AdvancedInsights] Skipped ${invalidDates} occurrences with invalid dates in trend`);
    }

    const result = Array.from(trendByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 weeks
      .map(([period, data]) => ({
        period,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      }));

    return result;
  }

  /**
   * Compare recurring vs unique task completion rates
   */
  private calculateRecurringVsUniqueComparison(
    userTasks: StatsTask[],
    occurrences: StatsOccurrence[]
  ) {
    const recurringTaskIds = new Set(
      userTasks.filter((t) => StatsUtils.isRecurringTask(t, occurrences)).map((t) => t.id)
    );
    const uniqueTaskIds = new Set(
      userTasks.filter((t) => StatsUtils.isUniqueTask(t, occurrences)).map((t) => t.id)
    );
    
    const recurringOccs = occurrences.filter((o) =>
      o?.taskId ? recurringTaskIds.has(o.taskId) : false
    );
    const uniqueOccs = occurrences.filter((o) =>
      o?.taskId ? uniqueTaskIds.has(o.taskId) : false
    );

    const recurringCompletionRate =
      recurringOccs.length > 0
        ? (recurringOccs.filter((o) => o?.status === "completed").length / recurringOccs.length) *
          100
        : 0;
    const uniqueCompletionRate =
      uniqueOccs.length > 0
        ? (uniqueOccs.filter((o) => o?.status === "completed").length / uniqueOccs.length) * 100
        : 0;

    return {
      recurringCompletionRate,
      uniqueCompletionRate,
    };
  }

  /**
   * Identify tasks with high pending or skipped occurrences
   */
  private calculateBottlenecks(userTasks: StatsTask[], occurrences: StatsOccurrence[]): Bottleneck[] {
    const taskOccurrenceMap = new Map<number, any[]>();

    for (const occ of occurrences) {
      if (!occ?.taskId) continue;

      if (!taskOccurrenceMap.has(occ.taskId)) {
        taskOccurrenceMap.set(occ.taskId, []);
      }
      taskOccurrenceMap.get(occ.taskId)!.push(occ);
    }

    return Array.from(taskOccurrenceMap.entries())
      .map(([taskId, occs]) => {
        const task = userTasks.find((t) => t?.id === taskId);
        if (!task) return null;

        const pending = occs.filter((o) => o?.status === "pending" || o?.status === "in_progress").length;
        const skipped = occs.filter((o) => o?.status === "skipped").length;

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

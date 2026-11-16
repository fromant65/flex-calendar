/**
 * Recurrence Stats Calculator - Handles habit and recurrence-related statistics
 */

import type { RecurrenceStatsData, HabitCompliancePoint, DayFrequency, DayOfWeek } from "~/types";
import type { StatsDataset, StatsTask, StatsOccurrence } from "./stats-types";
import { StatsUtils } from "./stats-utils";
import { RecurrenceStatsInsightsGenerator } from "./insights-generators";

export class RecurrenceStatsCalculator {
  /**
   * Calculate all recurrence statistics (habits)
   */
  calculate(dataset: StatsDataset): RecurrenceStatsData {
    try {
      const { tasks: userTasks = [], occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences)) {
        console.error("[RecurrenceStats] Invalid data structure:", {
          tasksIsArray: Array.isArray(userTasks),
          occurrencesIsArray: Array.isArray(occurrences),
        });
        return this.getDefaultStats();
      }

      console.log(
        `[RecurrenceStats] Processing ${userTasks.length} tasks and ${occurrences.length} occurrences`
      );

      // In V2 we infer habitual tasks by repeated generated occurrences.
      const habitTasks = userTasks.filter((t) => {
        const taskOccurrences = occurrences.filter((o) => o.taskId === t.id);
        return taskOccurrences.length > 1;
      });

      console.log(`[RecurrenceStats] Found ${habitTasks.length} habit tasks`);

      if (habitTasks.length === 0) {
        console.log("[RecurrenceStats] No habits found, returning default stats");
        return this.getDefaultStats();
      }

      const habitTaskIds = new Set(habitTasks.map((t) => t.id));
      const habitOccurrences = occurrences.filter(
        (o) => o?.taskId && habitTaskIds.has(o.taskId)
      );

      console.log(`[RecurrenceStats] Found ${habitOccurrences.length} habit occurrences`);

      // Calculate habit compliance over time
      const habitCompliance = this.calculateHabitCompliance(habitOccurrences);

      // Calculate streaks
      const { maxStreak, currentStreak } = StatsUtils.calculateStreaks(habitCompliance);

      // Calculate frequent days
      const frequentDays = this.calculateFrequentDays(habitOccurrences);

      console.log(
        `[RecurrenceStats] Calculated: maxStreak=${maxStreak}, currentStreak=${currentStreak}`
      );

      const stats: RecurrenceStatsData = {
        habitCompliance,
        maxStreak,
        currentStreak,
        frequentDays,
      };

      // Generate insights
      stats.insights = RecurrenceStatsInsightsGenerator.generate(stats);

      return stats;
    } catch (error) {
      console.error("[RecurrenceStats] Error calculating recurrence stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate habit compliance by week
   */
  private calculateHabitCompliance(habitOccurrences: StatsOccurrence[]): HabitCompliancePoint[] {
    const complianceByWeek = new Map<string, { completed: number; total: number }>();
    let invalidDates = 0;

    for (const occ of habitOccurrences) {
      if (!occ?.slotStartAt && !occ?.createdAt) {
        invalidDates++;
        continue;
      }

      try {
        const date = new Date(occ.slotStartAt ?? occ.createdAt);
        if (isNaN(date.getTime())) {
          console.warn(`[RecurrenceStats] Invalid slotStartAt for occurrence ${occ.id}: ${occ.slotStartAt}`);
          invalidDates++;
          continue;
        }

        const weekKey = StatsUtils.getWeekKey(date);

        if (!complianceByWeek.has(weekKey)) {
          complianceByWeek.set(weekKey, { completed: 0, total: 0 });
        }

        const week = complianceByWeek.get(weekKey)!;
        week.total++;
        if (occ.status === "completed") {
          week.completed++;
        }
      } catch (error) {
        console.error(`[RecurrenceStats] Error processing occurrence ${occ.id}:`, error);
        invalidDates++;
        continue;
      }
    }

    if (invalidDates > 0) {
      console.warn(`[RecurrenceStats] Skipped ${invalidDates} occurrences with invalid dates`);
    }

    const result = Array.from(complianceByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekKey, data]) => ({
        date: StatsUtils.getDateFromWeekKey(weekKey),
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        completedOccurrences: data.completed,
        totalOccurrences: data.total,
      }));

    console.log(`[RecurrenceStats] Calculated compliance for ${result.length} weeks`);
    return result;
  }

  /**
   * Calculate completion frequency by day of week
   */
  private calculateFrequentDays(habitOccurrences: StatsOccurrence[]): DayFrequency[] {
    const dayCount = new Map<string, { completed: number; total: number }>();
    const dayNames: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (const occ of habitOccurrences) {
      try {
        // Count completed occurrences
        if (occ?.completedAt) {
          const date = new Date(occ.completedAt);
          if (!isNaN(date.getTime())) {
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const dayName = dayNames[dayIndex];

            if (dayName && !dayCount.has(dayName)) {
              dayCount.set(dayName, { completed: 0, total: 0 });
            }
            if (dayName) {
              const day = dayCount.get(dayName)!;
              day.completed++;
            }
          }
        }

        // Count all occurrences
        if (occ?.slotStartAt || occ?.createdAt) {
          const date = new Date(occ.slotStartAt ?? occ.createdAt);
          if (!isNaN(date.getTime())) {
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const dayName = dayNames[dayIndex];
            if (dayName && !dayCount.has(dayName)) {
              dayCount.set(dayName, { completed: 0, total: 0 });
            }
            if (dayName) {
              dayCount.get(dayName)!.total++;
            }
          }
        }
      } catch (error) {
        continue; // Skip invalid occurrences
      }
    }

    return dayNames.map((day) => {
      const data = dayCount.get(day) || { completed: 0, total: 0 };
      return {
        day,
        completionCount: data.completed,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      };
    });
  }

  /**
   * Get default stats when data is unavailable
   */
  private getDefaultStats(): RecurrenceStatsData {
    return {
      habitCompliance: [],
      maxStreak: 0,
      currentStreak: 0,
      frequentDays: [
        { day: "Mon", completionCount: 0, completionRate: 0 },
        { day: "Tue", completionCount: 0, completionRate: 0 },
        { day: "Wed", completionCount: 0, completionRate: 0 },
        { day: "Thu", completionCount: 0, completionRate: 0 },
        { day: "Fri", completionCount: 0, completionRate: 0 },
        { day: "Sat", completionCount: 0, completionRate: 0 },
        { day: "Sun", completionCount: 0, completionRate: 0 },
      ],
    };
  }
}

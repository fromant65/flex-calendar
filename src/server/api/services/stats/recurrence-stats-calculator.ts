/**
 * Recurrence Stats Calculator - Handles habit and recurrence-related statistics
 */

import type { RecurrenceStatsData, HabitCompliancePoint, DayFrequency, DayOfWeek } from "~/types";
import { StatsUtils } from "./stats-utils";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class RecurrenceStatsCalculator {
  /**
   * Calculate all recurrence statistics (habits)
   */
  calculate(dataset: UserDataset): RecurrenceStatsData {
    try {
      const { tasks: userTasks = [], occurrences = [], recurrenceMap } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences) || !recurrenceMap) {
        console.warn("Invalid data structure in calculateRecurrenceStats");
        return this.getDefaultStats();
      }

      // Filter habits (tasks with recurrence and no maxOccurrences or maxOccurrences > 10)
      const habitTasks = userTasks.filter((t) => {
        if (!t?.recurrenceId) return false;
        const rec = recurrenceMap.get(t.recurrenceId);
        return rec && (!rec.maxOccurrences || rec.maxOccurrences > 10);
      });

      if (habitTasks.length === 0) {
        return this.getDefaultStats();
      }

      const habitTaskIds = new Set(habitTasks.map((t) => t.id));
      const habitOccurrences = occurrences.filter(
        (o) => o?.associatedTaskId && habitTaskIds.has(o.associatedTaskId)
      );

      // Calculate habit compliance over time
      const habitCompliance = this.calculateHabitCompliance(habitOccurrences);

      // Calculate streaks
      const { maxStreak, currentStreak } = StatsUtils.calculateStreaks(habitCompliance);

      // Calculate frequent days
      const frequentDays = this.calculateFrequentDays(habitOccurrences);

      return {
        habitCompliance,
        maxStreak,
        currentStreak,
        frequentDays,
      };
    } catch (error) {
      console.error("Error calculating recurrence stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate habit compliance by week
   */
  private calculateHabitCompliance(habitOccurrences: any[]): HabitCompliancePoint[] {
    const complianceByWeek = new Map<string, { completed: number; total: number }>();

    for (const occ of habitOccurrences) {
      if (!occ?.startDate) continue;

      try {
        const date = new Date(occ.startDate);
        if (isNaN(date.getTime())) continue;

        const weekKey = StatsUtils.getWeekKey(date);

        if (!complianceByWeek.has(weekKey)) {
          complianceByWeek.set(weekKey, { completed: 0, total: 0 });
        }

        const week = complianceByWeek.get(weekKey)!;
        week.total++;
        if (occ.status === "Completed") {
          week.completed++;
        }
      } catch (error) {
        continue; // Skip invalid occurrences
      }
    }

    return Array.from(complianceByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekKey, data]) => ({
        date: StatsUtils.getDateFromWeekKey(weekKey),
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        completedOccurrences: data.completed,
        totalOccurrences: data.total,
      }));
  }

  /**
   * Calculate completion frequency by day of week
   */
  private calculateFrequentDays(habitOccurrences: any[]): DayFrequency[] {
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
        if (occ?.startDate) {
          const date = new Date(occ.startDate);
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

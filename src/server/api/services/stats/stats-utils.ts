/**
 * Stats Utils - Shared utility functions for statistics calculations
 */

import type { HabitCompliancePoint } from "~/types";
import type { StatsTask, StatsRecurrence } from "./stats-types";

export class StatsUtils {
  /**
   * Get week key in format YYYY-Www
   */
  static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNum = this.getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
  }

  /**
   * Get ISO week number for a date
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Convert week key back to date
   */
  static getDateFromWeekKey(weekKey: string): Date {
    const parts = weekKey.split("-W");
    const year = Number(parts[0]);
    const week = Number(parts[1]);

    if (isNaN(year) || isNaN(week)) {
      return new Date();
    }

    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const isoWeekStart = simple;
    if (dow <= 4) isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return isoWeekStart;
  }

  /**
   * Calculate streaks from compliance data
   */
  static calculateStreaks(compliance: HabitCompliancePoint[]): {
    maxStreak: number;
    currentStreak: number;
  } {
    if (compliance.length === 0) return { maxStreak: 0, currentStreak: 0 };

    let maxStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    // Sort by date
    const sorted = [...compliance].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i];
      if (point && point.completionRate === 100) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak from the end
    for (let i = sorted.length - 1; i >= 0; i--) {
      const point = sorted[i];
      if (point && point.completionRate === 100) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { maxStreak, currentStreak };
  }

  /**
   * Check if a task is recurring (has interval defined)
   * Recurring tasks have a defined interval in their recurrence pattern
   */
  static isRecurringTask(
    task: StatsTask,
    recurrenceMap: Map<number, StatsRecurrence>
  ): boolean {
    if (!task?.recurrenceId) return false;
    const recurrence = recurrenceMap.get(task.recurrenceId);
    if (!recurrence) return false;

    // Rule 1: If it has an interval, it's recurring
    if (recurrence.interval !== null && recurrence.interval !== undefined) return true;

    // Rule 2: If it defines daysOfWeek or daysOfMonth AND the recurrence is not "fixed" (no endDate and no maxOccurrences), treat as recurring
    const hasDaysOfWeek = Array.isArray(recurrence.daysOfWeek) && recurrence.daysOfWeek.length > 0;
    const hasDaysOfMonth = Array.isArray(recurrence.daysOfMonth) && recurrence.daysOfMonth.length > 0;

    const isFixedRecurrence = (rec: StatsRecurrence) => {
      return (rec.endDate !== null && rec.endDate !== undefined) || (rec.maxOccurrences !== null && rec.maxOccurrences !== undefined);
    };

    if ((hasDaysOfWeek || hasDaysOfMonth) && !isFixedRecurrence(recurrence)) return true;

    // Otherwise it's not a recurring pattern (treated as unique)
    return false;
  }

  /**
   * Check if a task is unique (no interval defined)
   * Unique tasks have recurrence but no interval - they use daysOfWeek or daysOfMonth
   */
  static isUniqueTask(
    task: StatsTask,
    recurrenceMap: Map<number, StatsRecurrence>
  ): boolean {
    // Unique = has recurrenceId (or no recurrence) but does NOT satisfy recurring rules
    if (!task?.recurrenceId) return true; // tasks without recurrenceId are unique
    const recurrence = recurrenceMap.get(task.recurrenceId);
    if (!recurrence) return true;

    return !this.isRecurringTask(task, recurrenceMap);
  }

  /**
   * Calculate recurring vs unique tasks distribution
   */
  static calculateRecurringVsUnique(
    tasks: StatsTask[],
    recurrenceMap: Map<number, StatsRecurrence>
  ): { recurring: number; unique: number } {
    const recurringCount = tasks.filter((t) => this.isRecurringTask(t, recurrenceMap)).length;
    const uniqueCount = tasks.filter((t) => this.isUniqueTask(t, recurrenceMap)).length;

    return {
      recurring: recurringCount,
      unique: uniqueCount,
    };
  }
}

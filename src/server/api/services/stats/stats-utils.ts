/**
 * Stats Utils - Shared utility functions for statistics calculations
 */

import type { HabitCompliancePoint } from "~/types";

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
}

/**
 * Task Streak Service - handles completion streak calculation
 * 
 * A streak is the count of consecutive completed occurrences
 * starting from the most recent occurrence backwards.
 * 
 * Rules:
 * - Streak counts only COMPLETED occurrences
 * - Streak breaks on SKIPPED occurrences
 * - Streak resets to 0 if there's an EXPIRED occurrence (pending/in-progress past limit date)
 * - Only counts the LAST streak, not the maximum streak
 */

import type { TaskOccurrence } from "../types";
import { OccurrenceAdapter } from "../../adapter";

export interface TaskStreakInfo {
  taskId: number;
  currentStreak: number;
  totalCompleted: number;
  totalOccurrences: number;
  completionRate: number;
}

export class TaskStreakService {
  private occurrenceAdapter: OccurrenceAdapter;

  constructor() {
    this.occurrenceAdapter = new OccurrenceAdapter();
  }

  /**
   * Calculate the current streak for a task
   * @param taskId - The task ID
   * @returns Streak information
   */
  async getTaskStreak(taskId: number): Promise<TaskStreakInfo> {
    const occurrences = await this.occurrenceAdapter.getOccurrencesByTaskIdRaw(taskId);
    
    if (occurrences.length === 0) {
      return {
        taskId,
        currentStreak: 0,
        totalCompleted: 0,
        totalOccurrences: 0,
        completionRate: 0,
      };
    }

    // Sort by start date descending (most recent first)
    const sorted = [...occurrences].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const now = new Date();
    let currentStreak = 0;

    // Check for expired occurrences first - these reset the streak
    const hasExpiredOccurrence = sorted.some((occ) => {
      if (occ.status === "Pending" || occ.status === "In Progress") {
        if (occ.limitDate && new Date(occ.limitDate) < now) {
          return true; // Found expired occurrence
        }
      }
      return false;
    });

    // If there's an expired occurrence, streak is 0
    if (hasExpiredOccurrence) {
      currentStreak = 0;
    } else {
      // Count consecutive completions from most recent
      for (const occ of sorted) {
        if (occ.status === "Completed") {
          currentStreak++;
        } else if (occ.status === "Skipped") {
          // Skip breaks the streak
          break;
        }
        // Pending/In Progress don't affect streak count from the past
      }
    }

    // Calculate total stats
    const totalCompleted = occurrences.filter((o) => o.status === "Completed").length;
    const totalOccurrences = occurrences.length;
    const completionRate = totalOccurrences > 0 
      ? (totalCompleted / totalOccurrences) * 100 
      : 0;

    return {
      taskId,
      currentStreak,
      totalCompleted,
      totalOccurrences,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Get streaks for multiple tasks
   * @param taskIds - Array of task IDs
   * @returns Map of task ID to streak info
   */
  async getTaskStreaks(taskIds: number[]): Promise<Map<number, TaskStreakInfo>> {
    const streakInfos = await Promise.all(
      taskIds.map((id) => this.getTaskStreak(id))
    );

    const streakMap = new Map<number, TaskStreakInfo>();
    streakInfos.forEach((info) => {
      streakMap.set(info.taskId, info);
    });

    return streakMap;
  }

  /**
   * Get streaks for all tasks owned by a user
   * @param userId - The user ID
   * @returns Array of streak info for all user's tasks
   */
  async getUserTaskStreaks(userId: string): Promise<TaskStreakInfo[]> {
    const occurrences = await this.occurrenceAdapter.getOccurrencesByOwnerWithTask(userId);
    
    // Group by task ID
    const occurrencesByTask = new Map<number, TaskOccurrence[]>();
    occurrences.forEach((occ: any) => {
      if (!occurrencesByTask.has(occ.associatedTaskId)) {
        occurrencesByTask.set(occ.associatedTaskId, []);
      }
      occurrencesByTask.get(occ.associatedTaskId)!.push(occ);
    });

    // Calculate streak for each task
    const taskIds = Array.from(occurrencesByTask.keys());
    const streaks = await this.getTaskStreaks(taskIds);

    return Array.from(streaks.values());
  }
}

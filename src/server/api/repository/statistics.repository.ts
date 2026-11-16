/**
 * Statistics Repository - handles complex database queries for statistics
 */

import { eq, and, sql, gte, lte, desc, inArray } from "drizzle-orm";
import { tasks, taskOccurrences } from "~/server/db/schema";
import { db } from "~/server/db";
import type { TaskOccurrenceStatus } from "../services/types";
import type { StatsEvent } from "../services/stats/stats-types";

export class StatisticsRepository {
  /**
   * Get all tasks for a user with their occurrences
   */
  async findUserTasksWithOccurrences(userId: string) {
    return await db
      .select()
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.taskId, tasks.id))
      .where(eq(tasks.ownerId, userId));
  }

  /**
   * Get all agenda entries for a user (derived from scheduled occurrences)
   */
  async findUserCalendarEvents(userId: string) {
    const rows = await db
      .select({
        occurrenceId: taskOccurrences.id,
        ownerId: tasks.ownerId,
        slotStartAt: taskOccurrences.slotStartAt,
        slotEndAt: taskOccurrences.slotEndAt,
        status: taskOccurrences.status,
        timeSpentMinutes: taskOccurrences.timeSpentMinutes,
      })
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.taskId, tasks.id))
      .where(
        and(
          eq(tasks.ownerId, userId),
          sql`${taskOccurrences.slotStartAt} IS NOT NULL`,
          sql`${taskOccurrences.slotEndAt} IS NOT NULL`,
        ),
      );

    return rows.map((row): StatsEvent => ({
      id: row.occurrenceId,
      ownerId: row.ownerId,
      start: row.slotStartAt!,
      finish: row.slotEndAt!,
      isCompleted: row.status === "completed",
      associatedOccurrenceId: row.occurrenceId,
      dedicatedTime: row.timeSpentMinutes / 60,
    }));
  }

  /**
   * Get all tasks for a user
   */
  async findUserTasks(userId: string) {
    return await db.select().from(tasks).where(eq(tasks.ownerId, userId));
  }

  /**
   * Get tasks with completion status
   */
  async findCompletedTasks(userId: string) {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.ownerId, userId), sql`${tasks.completedAt} IS NOT NULL`))
      .orderBy(desc(tasks.completedAt));
  }

  /**
   * Get occurrences with specific status
   */
  async findOccurrencesByStatus(userId: string, status: TaskOccurrenceStatus) {
    return await db
      .select()
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.taskId, tasks.id))
      .where(and(eq(tasks.ownerId, userId), eq(taskOccurrences.status, status)));
  }

  /**
   * Get agenda entries within a date range (derived from scheduled occurrences)
   */
  async findEventsInRange(userId: string, startDate: Date, endDate: Date) {
    const allEntries = await this.findUserCalendarEvents(userId);
    return allEntries.filter((entry) => entry.start >= startDate && entry.start <= endDate);
  }

  /**
   * Get habitual tasks inferred from repeated occurrences
   */
  async findHabitTasks(userId: string) {
    const userTasks = await this.findUserTasks(userId);
    const taskIds = userTasks.map((task) => task.id);
    if (taskIds.length === 0) return [];

    const occurrences = await db
      .select({
        taskId: taskOccurrences.taskId,
      })
      .from(taskOccurrences)
      .where(inArray(taskOccurrences.taskId, taskIds));

    const countByTask = new Map<number, number>();
    occurrences.forEach((occ) => {
      countByTask.set(occ.taskId, (countByTask.get(occ.taskId) ?? 0) + 1);
    });

    return userTasks.filter((task) => (countByTask.get(task.id) ?? 0) > 1);
  }

  /**
   * Get occurrences for specific tasks
   */
  async findOccurrencesByTaskIds(taskIds: number[]) {
    if (taskIds.length === 0) return [];
    
    return await db
      .select()
      .from(taskOccurrences)
      .where(inArray(taskOccurrences.taskId, taskIds));
  }
}

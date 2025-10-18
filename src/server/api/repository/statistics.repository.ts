/**
 * Statistics Repository - handles complex database queries for statistics
 */

import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { tasks, taskRecurrences, taskOccurrences, calendarEvents } from "~/server/db/schema";
import { db } from "~/server/db";

export class StatisticsRepository {
  /**
   * Get all tasks for a user with their occurrences
   */
  async findUserTasksWithOccurrences(userId: string) {
    return await db
      .select()
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.associatedTaskId, tasks.id))
      .where(eq(tasks.ownerId, userId));
  }

  /**
   * Get all calendar events for a user
   */
  async findUserCalendarEvents(userId: string) {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.ownerId, userId));
  }

  /**
   * Get all tasks for a user
   */
  async findUserTasks(userId: string) {
    return await db.select().from(tasks).where(eq(tasks.ownerId, userId));
  }

  /**
   * Get recurrences for user's tasks
   */
  async findUserRecurrences(userId: string) {
    return await db
      .select()
      .from(taskRecurrences)
      .where(
        sql`${taskRecurrences.id} IN (SELECT ${tasks.recurrenceId} FROM ${tasks} WHERE ${tasks.ownerId} = ${userId})`
      );
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
  async findOccurrencesByStatus(userId: string, status: string) {
    return await db
      .select()
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.associatedTaskId, tasks.id))
      .where(and(eq(tasks.ownerId, userId), eq(taskOccurrences.status, status)));
  }

  /**
   * Get events within a date range
   */
  async findEventsInRange(userId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.ownerId, userId),
          gte(calendarEvents.start, startDate),
          lte(calendarEvents.start, endDate)
        )
      )
      .orderBy(calendarEvents.start);
  }

  /**
   * Get habit tasks (recurring with no max occurrences or high max occurrences)
   */
  async findHabitTasks(userId: string) {
    const userTasks = await db
      .select()
      .from(tasks)
      .innerJoin(taskRecurrences, eq(tasks.recurrenceId, taskRecurrences.id))
      .where(
        and(
          eq(tasks.ownerId, userId),
          sql`(${taskRecurrences.maxOccurrences} IS NULL OR ${taskRecurrences.maxOccurrences} > 10)`
        )
      );

    return userTasks;
  }

  /**
   * Get occurrences for specific tasks
   */
  async findOccurrencesByTaskIds(taskIds: number[]) {
    if (taskIds.length === 0) return [];
    
    return await db
      .select()
      .from(taskOccurrences)
      .where(sql`${taskOccurrences.associatedTaskId} IN (${sql.join(taskIds, sql`, `)})`);
  }
}

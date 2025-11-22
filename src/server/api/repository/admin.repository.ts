/**
 * Admin Repository - handles database queries for admin statistics and management
 */

import { eq, and, sql, gte, lte, count, countDistinct } from "drizzle-orm";
import { tasks, taskOccurrences, calendarEvents, users } from "~/server/db/schema";
import { db } from "~/server/db";

export class AdminRepository {
  /**
   * Get total number of users in the system
   */
  async getTotalUsersCount() {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count ?? 0;
  }

  /**
   * Get number of active users (users with activity in the last month)
   * Activity is defined as creating tasks, completing occurrences, or completing events
   */
  async getActiveUsersCount() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get users who created tasks in the last month
    const usersWithTasks = await db
      .selectDistinct({ userId: tasks.ownerId })
      .from(tasks)
      .where(gte(tasks.createdAt, oneMonthAgo));

    // Get users who completed occurrences in the last month
    const usersWithCompletedOccurrences = await db
      .selectDistinct({ userId: tasks.ownerId })
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.associatedTaskId, tasks.id))
      .where(
        and(
          eq(taskOccurrences.status, "Completed"),
          sql`${taskOccurrences.completedAt} IS NOT NULL`,
          gte(taskOccurrences.completedAt, oneMonthAgo)
        )
      );

    // Get users who completed events in the last month
    const usersWithCompletedEvents = await db
      .selectDistinct({ userId: calendarEvents.ownerId })
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.isCompleted, true),
          sql`${calendarEvents.completedAt} IS NOT NULL`,
          gte(calendarEvents.completedAt, oneMonthAgo)
        )
      );

    // Combine and deduplicate user IDs
    const activeUserIds = new Set<string>();
    usersWithTasks.forEach((u) => activeUserIds.add(u.userId));
    usersWithCompletedOccurrences.forEach((u) => activeUserIds.add(u.userId));
    usersWithCompletedEvents.forEach((u) => activeUserIds.add(u.userId));

    return activeUserIds.size;
  }

  /**
   * Get total tasks created in a date range across all users
   */
  async getTasksCreatedInRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(tasks)
      .where(and(gte(tasks.createdAt, startDate), lte(tasks.createdAt, endDate)));
  }

  /**
   * Get total occurrences created in a date range across all users
   */
  async getOccurrencesCreatedInRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(taskOccurrences)
      .where(
        and(gte(taskOccurrences.createdAt, startDate), lte(taskOccurrences.createdAt, endDate))
      );
  }

  /**
   * Get total events created in a date range across all users
   */
  async getEventsCreatedInRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(calendarEvents)
      .where(and(gte(calendarEvents.createdAt, startDate), lte(calendarEvents.createdAt, endDate)));
  }

  /**
   * Get completed occurrences in a date range across all users
   */
  async getCompletedOccurrencesInRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(taskOccurrences)
      .where(
        and(
          eq(taskOccurrences.status, "Completed"),
          sql`${taskOccurrences.completedAt} IS NOT NULL`,
          gte(taskOccurrences.completedAt, startDate),
          lte(taskOccurrences.completedAt, endDate)
        )
      );
  }

  /**
   * Get completed events in a date range across all users
   */
  async getCompletedEventsInRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.isCompleted, true),
          sql`${calendarEvents.completedAt} IS NOT NULL`,
          gte(calendarEvents.completedAt, startDate),
          lte(calendarEvents.completedAt, endDate)
        )
      );
  }

  /**
   * Get users with activity in a date range
   */
  async getUsersWithActivityInRange(startDate: Date, endDate: Date) {
    // Get users who have created tasks, occurrences, or events in the range
    const usersWithTasks = await db
      .selectDistinct({ userId: tasks.ownerId })
      .from(tasks)
      .where(and(gte(tasks.createdAt, startDate), lte(tasks.createdAt, endDate)));

    const usersWithEvents = await db
      .selectDistinct({ userId: calendarEvents.ownerId })
      .from(calendarEvents)
      .where(and(gte(calendarEvents.createdAt, startDate), lte(calendarEvents.createdAt, endDate)));

    // Combine and deduplicate user IDs
    const userIds = new Set<string>();
    usersWithTasks.forEach((u) => userIds.add(u.userId));
    usersWithEvents.forEach((u) => userIds.add(u.userId));

    if (userIds.size === 0) return [];

    // Get full user information
    return await db
      .select()
      .from(users)
      .where(sql`${users.id} IN (${sql.join(Array.from(userIds).map((id) => sql`${id}`), sql`, `)})`);
  }

  /**
   * Get tasks created by a specific user in a date range
   */
  async getUserTasksInRange(userId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.ownerId, userId),
          gte(tasks.createdAt, startDate),
          lte(tasks.createdAt, endDate)
        )
      );
  }

  /**
   * Get occurrences completed by a specific user in a date range
   */
  async getUserCompletedOccurrencesInRange(userId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(taskOccurrences)
      .innerJoin(tasks, eq(taskOccurrences.associatedTaskId, tasks.id))
      .where(
        and(
          eq(tasks.ownerId, userId),
          eq(taskOccurrences.status, "Completed"),
          sql`${taskOccurrences.completedAt} IS NOT NULL`,
          gte(taskOccurrences.completedAt, startDate),
          lte(taskOccurrences.completedAt, endDate)
        )
      );
  }

  /**
   * Get events completed by a specific user in a date range
   */
  async getUserCompletedEventsInRange(userId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.ownerId, userId),
          eq(calendarEvents.isCompleted, true),
          sql`${calendarEvents.completedAt} IS NOT NULL`,
          gte(calendarEvents.completedAt, startDate),
          lte(calendarEvents.completedAt, endDate)
        )
      );
  }

  /**
   * Get all users with their basic information
   */
  async getAllUsers() {
    return await db.select().from(users);
  }

  /**
   * Get all users with activity statistics
   */
  async getAllUsersWithStats() {
    const allUsers = await db.select().from(users);
    
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const [userTasks, userOccurrences, userEvents] = await Promise.all([
          db.select({ count: count() }).from(tasks).where(eq(tasks.ownerId, user.id)),
          db
            .select({ count: count() })
            .from(taskOccurrences)
            .innerJoin(tasks, eq(taskOccurrences.associatedTaskId, tasks.id))
            .where(eq(tasks.ownerId, user.id)),
          db.select({ count: count() }).from(calendarEvents).where(eq(calendarEvents.ownerId, user.id)),
        ]);

        return {
          ...user,
          totalTasks: userTasks[0]?.count ?? 0,
          totalOccurrences: userOccurrences[0]?.count ?? 0,
          totalEvents: userEvents[0]?.count ?? 0,
        };
      })
    );

    return usersWithStats;
  }
}

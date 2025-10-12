/**
 * Task Repository - handles database operations for tasks
 */

import { eq, and, desc } from "drizzle-orm";
import { tasks } from "~/server/db/schema";
import { db } from "~/server/db";
import { BaseRepository } from "./base.repository";

type TaskSelect = typeof tasks.$inferSelect;

export class TaskRepository extends BaseRepository<typeof tasks> {
  constructor() {
    super(tasks);
  }

  /**
   * Find all tasks for a specific owner
   */
  async findByOwnerId(ownerId: string): Promise<TaskSelect[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.ownerId, ownerId))
      .orderBy(desc(tasks.createdAt));
  }

  /**
   * Find active tasks for a specific owner
   */
  async findActiveByOwnerId(ownerId: string): Promise<TaskSelect[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.ownerId, ownerId), eq(tasks.isActive, true)))
      .orderBy(desc(tasks.importance), desc(tasks.createdAt));
  }

  /**
   * Find task with its recurrence
   */
  async findWithRecurrence(taskId: number) {
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        recurrence: true,
      },
    });
    return result;
  }

  /**
   * Find tasks with their recurrences for a specific owner
   */
  async findByOwnerIdWithRecurrence(ownerId: string) {
    return await db.query.tasks.findMany({
      where: eq(tasks.ownerId, ownerId),
      with: {
        recurrence: true,
      },
      orderBy: [desc(tasks.createdAt)],
    });
  }
}

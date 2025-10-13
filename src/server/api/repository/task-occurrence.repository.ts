/**
 * Task Occurrence Repository - handles database operations for task occurrences
 */

import { eq, and, gte, lte, desc, inArray } from "drizzle-orm";
import { taskOccurrences } from "~/server/db/schema";
import { db } from "~/server/db";
import { BaseRepository } from "./base.repository";

type OccurrenceSelect = typeof taskOccurrences.$inferSelect;

export class TaskOccurrenceRepository extends BaseRepository<typeof taskOccurrences> {
  constructor() {
    super(taskOccurrences);
  }

  /**
   * Find all occurrences for a specific task
   */
  async findByTaskId(taskId: number): Promise<OccurrenceSelect[]> {
    return await db
      .select()
      .from(taskOccurrences)
      .where(eq(taskOccurrences.associatedTaskId, taskId))
      .orderBy(desc(taskOccurrences.startDate));
  }

  /**
   * Find occurrences by status for a specific task
   */
  async findByTaskIdAndStatus(taskId: number, status: string): Promise<OccurrenceSelect[]> {
    return await db
      .select()
      .from(taskOccurrences)
      .where(
        and(
          eq(taskOccurrences.associatedTaskId, taskId),
          eq(taskOccurrences.status, status),
        ),
      )
      .orderBy(desc(taskOccurrences.startDate));
  }

  /**
   * Find occurrences within a date range and include the associated task
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<(OccurrenceSelect & { task?: any | null })[]> {
    const results = await db.query.taskOccurrences.findMany({
      where: and(
        gte(taskOccurrences.startDate, startDate),
        lte(taskOccurrences.startDate, endDate),
      ),
      with: {
        task: true,
      },
    });

    // Ensure consistent ordering by startDate
    return results.sort((a, b) => {
      const aTime = a.startDate instanceof Date ? a.startDate.getTime() : new Date(a.startDate).getTime();
      const bTime = b.startDate instanceof Date ? b.startDate.getTime() : new Date(b.startDate).getTime();
      return aTime - bTime;
    });
  }

  /**
   * Find occurrences with task details
   */
  async findWithTask(occurrenceId: number) {
    return await db.query.taskOccurrences.findFirst({
      where: eq(taskOccurrences.id, occurrenceId),
      with: {
        task: true,
      },
    });
  }

  /**
   * Find all occurrences with task details for a specific user
   */
  async findByOwnerIdWithTask(ownerId: string) {
    return await db.query.taskOccurrences.findMany({
      with: {
        task: true,
      },
    });
  }

  /**
   * Find pending or in-progress occurrences for a task
   */
  async findActiveByTaskId(taskId: number): Promise<OccurrenceSelect[]> {
    return await db
      .select()
      .from(taskOccurrences)
      .where(
        and(
          eq(taskOccurrences.associatedTaskId, taskId),
          inArray(taskOccurrences.status, ["Pending", "In Progress"]),
        ),
      )
      .orderBy(taskOccurrences.startDate);
  }

  /**
   * Get the latest occurrence for a task
   */
  async findLatestByTaskId(taskId: number): Promise<OccurrenceSelect | undefined> {
    const [result] = await db
      .select()
      .from(taskOccurrences)
      .where(eq(taskOccurrences.associatedTaskId, taskId))
      .orderBy(desc(taskOccurrences.startDate))
      .limit(1);
    return result;
  }
}

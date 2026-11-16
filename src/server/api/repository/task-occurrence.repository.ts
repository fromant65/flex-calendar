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
      .where(eq(taskOccurrences.taskId, taskId))
      .orderBy(desc(taskOccurrences.slotStartAt));
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
          eq(taskOccurrences.taskId, taskId),
          eq(taskOccurrences.status, status as OccurrenceSelect["status"]),
        ),
      )
      .orderBy(desc(taskOccurrences.slotStartAt));
  }

  /**
   * Find occurrences within a date range and include the associated task
   */
  async findByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<(OccurrenceSelect & { task?: any | null })[]> {
    const results = await db.query.taskOccurrences.findMany({
      where: and(
        gte(taskOccurrences.slotStartAt, startDate),
        lte(taskOccurrences.slotStartAt, endDate),
      ),
      with: {
        task: true,
      },
    });

    // Filter by userId if provided
    const filtered = userId 
      ? results.filter(occ => occ.task?.ownerId === userId)
      : results;

    // Ensure consistent ordering by startDate
    return filtered.sort((a, b) => {
      const aTime = a.slotStartAt instanceof Date ? a.slotStartAt.getTime() : new Date(a.slotStartAt ?? 0).getTime();
      const bTime = b.slotStartAt instanceof Date ? b.slotStartAt.getTime() : new Date(b.slotStartAt ?? 0).getTime();
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
      where: (occurrences, { eq }) => {
        // We need to get task IDs for this owner first
        // This is a workaround since we can't directly join in findMany
        return eq(occurrences.taskId, occurrences.taskId); // This will be filtered below
      },
    }).then(async (allOccurrences) => {
      // Filter occurrences by owner through the task relation
      return allOccurrences.filter(occ => occ.task?.ownerId === ownerId);
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
          eq(taskOccurrences.taskId, taskId),
          inArray(taskOccurrences.status, ["pending", "in_progress"]),
        ),
      )
      .orderBy(taskOccurrences.slotStartAt);
  }

  /**
   * Get the latest occurrence for a task
   */
  async findLatestByTaskId(taskId: number): Promise<OccurrenceSelect | undefined> {
    const [result] = await db
      .select()
      .from(taskOccurrences)
      .where(eq(taskOccurrences.taskId, taskId))
      .orderBy(desc(taskOccurrences.slotStartAt))
      .limit(1);
    return result;
  }

  /**
   * Find completed occurrences within a date range for a specific user
   */
  async findCompletedByOwnerIdInDateRange(ownerId: string, startDate: Date, endDate: Date) {
    return await db.query.taskOccurrences.findMany({
      where: and(
        eq(taskOccurrences.status, "completed"),
        gte(taskOccurrences.slotStartAt, startDate),
        lte(taskOccurrences.completedAt, endDate),
      ),
      with: {
        task: {
          with: {},
        },
      },
    }).then(results => 
      results.filter(occ => occ.task?.ownerId === ownerId)
    );
  }
}

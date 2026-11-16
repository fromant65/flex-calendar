/**
 * Calendar Event Repository - handles database operations for calendar events
 */

import { and, eq, gte, lte } from "drizzle-orm";
import { taskOccurrences, tasks } from "~/server/db/schema";
import { db } from "~/server/db";
import type { CalendarEvent, TaskOccurrence, Task } from "../services/types";

type OccurrenceSelect = typeof taskOccurrences.$inferSelect;
type TaskSelect = typeof tasks.$inferSelect;
type EventWithDetailsRow = CalendarEvent & {
  occurrence?: TaskOccurrence;
  task?: Task;
};

export class CalendarEventRepository {
  private mapOccurrenceToEvent(occurrence: OccurrenceSelect, task: TaskSelect): CalendarEvent {
    const start = occurrence.slotStartAt ?? occurrence.dueAt ?? occurrence.tentativeAt ?? occurrence.createdAt;
    const finish = occurrence.slotEndAt ?? start;

    return {
      id: occurrence.id,
      context: null,
      ownerId: task.ownerId,
      associatedOccurrenceId: occurrence.id,
      isFixed: task.isFixed,
      start,
      finish,
      isCompleted: occurrence.status === "completed",
      dedicatedTime: occurrence.timeSpentMinutes,
      completedAt: occurrence.completedAt,
      createdAt: occurrence.createdAt,
      updatedAt: occurrence.updatedAt,
    };
  }

  private async getOccurrenceWithTaskById(occurrenceId: number) {
    return await db.query.taskOccurrences.findFirst({
      where: eq(taskOccurrences.id, occurrenceId),
      with: {
        task: true,
      },
    });
  }

  private async listOccurrenceWithTaskByOwner(ownerId: string) {
    const rows = await db.query.taskOccurrences.findMany({
      with: {
        task: true,
      },
      where: gte(taskOccurrences.id, 0),
    });

    return rows.filter((row) => row.task?.ownerId === ownerId);
  }

  async create(data: {
    ownerId: string;
    context: string | null;
    associatedOccurrenceId: number | null;
    isFixed: boolean;
    start: Date;
    finish: Date;
    isCompleted: boolean;
    dedicatedTime: number;
  }): Promise<CalendarEvent> {
    if (!data.associatedOccurrenceId) {
      throw new Error("In V2, calendar events require an associated occurrence");
    }

    await db
      .update(taskOccurrences)
      .set({
        slotStartAt: data.start,
        slotEndAt: data.finish,
        status: "pending",
      })
      .where(eq(taskOccurrences.id, data.associatedOccurrenceId));

    const created = await this.findById(data.associatedOccurrenceId);
    if (!created) {
      throw new Error("Associated occurrence not found");
    }
    return created;
  }

  async findById(id: number): Promise<CalendarEvent | undefined> {
    const row = await this.getOccurrenceWithTaskById(id);
    if (!row?.task) return undefined;
    return this.mapOccurrenceToEvent(row, row.task);
  }

  async updateById(
    id: number,
    data: Partial<{
      context: string;
      isFixed: boolean;
      start: Date;
      finish: Date;
      isCompleted: boolean;
      dedicatedTime: number;
      completedAt: Date;
    }>,
  ): Promise<CalendarEvent | undefined> {
    const updateData: Partial<typeof taskOccurrences.$inferInsert> = {};

    if (data.start !== undefined) updateData.slotStartAt = data.start;
    if (data.finish !== undefined) updateData.slotEndAt = data.finish;
    if (data.dedicatedTime !== undefined) updateData.timeSpentMinutes = data.dedicatedTime;
    if (data.isCompleted === true) {
      updateData.status = "completed";
      updateData.completedAt = data.completedAt ?? new Date();
    }

    await db.update(taskOccurrences).set(updateData).where(eq(taskOccurrences.id, id));
    return await this.findById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }

    const result = await db
      .update(taskOccurrences)
      .set({
        slotStartAt: null,
        slotEndAt: null,
        status: "unassigned",
      })
      .where(eq(taskOccurrences.id, id));

    void result;
    return true;
  }

  /**
   * Find all events for a specific owner
   */
  async findByOwnerId(ownerId: string): Promise<CalendarEvent[]> {
    const rows = await this.listOccurrenceWithTaskByOwner(ownerId);
    return rows
      .filter((row) => row.slotStartAt && row.slotEndAt && row.task)
      .map((row) => this.mapOccurrenceToEvent(row, row.task!));
  }

  /**
   * Find events within a date range
   */
  async findByDateRange(ownerId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const events = await this.findByOwnerId(ownerId);
    return events.filter((event) => event.start >= startDate && event.start <= endDate);
  }

  /**
   * Find events for a specific occurrence
   */
  async findByOccurrenceId(occurrenceId: number): Promise<CalendarEvent[]> {
    const event = await this.findById(occurrenceId);
    return event ? [event] : [];
  }

  /**
   * Find event with occurrence and task details
   */
  async findWithDetails(eventId: number) {
    const row = await this.getOccurrenceWithTaskById(eventId);
    if (!row?.task) return undefined;

    return {
      ...this.mapOccurrenceToEvent(row, row.task),
      occurrence: row,
      task: row.task,
    } as EventWithDetailsRow;
  }

  /**
   * Find all events with details for a specific owner
   */
  async findByOwnerIdWithDetails(ownerId: string) {
    const rows = await this.listOccurrenceWithTaskByOwner(ownerId);
    return rows
      .filter((row) => row.slotStartAt && row.slotEndAt && row.task)
      .map((row) => ({
        ...this.mapOccurrenceToEvent(row, row.task!),
        occurrence: row,
        task: row.task!,
      }));
  }

  /**
   * Find events with details in a date range
   */
  async findByDateRangeWithDetails(ownerId: string, startDate: Date, endDate: Date) {
    const events = await this.findByOwnerIdWithDetails(ownerId);
    return events.filter((event) => event.start >= startDate && event.start <= endDate);
  }

  /**
   * Find incomplete events for an occurrence
   */
  async findIncompleteByOccurrenceId(occurrenceId: number): Promise<CalendarEvent[]> {
    const events = await this.findByOccurrenceId(occurrenceId);
    return events.filter((event) => !event.isCompleted);
  }

  /**
   * Find completed events for specific occurrence IDs with full details
   */
  async findCompletedByOccurrenceIds(occurrenceIds: number[]) {
    if (occurrenceIds.length === 0) return [];

    const events = await Promise.all(occurrenceIds.map((id) => this.findWithDetails(id)));
    return events.filter(
      (event): event is NonNullable<typeof event> =>
        !!event && event.isCompleted && !!event.associatedOccurrenceId,
    );
  }
}

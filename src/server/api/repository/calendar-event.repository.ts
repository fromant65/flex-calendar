/**
 * Calendar Event Repository - handles database operations for calendar events
 */

import { eq, and, gte, lte, desc } from "drizzle-orm";
import { calendarEvents } from "~/server/db/schema";
import { db } from "~/server/db";
import { BaseRepository } from "./base.repository";

type EventSelect = typeof calendarEvents.$inferSelect;

export class CalendarEventRepository extends BaseRepository<typeof calendarEvents> {
  constructor() {
    super(calendarEvents);
  }

  /**
   * Find all events for a specific owner
   */
  async findByOwnerId(ownerId: string): Promise<EventSelect[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.ownerId, ownerId))
      .orderBy(calendarEvents.start);
  }

  /**
   * Find events within a date range
   */
  async findByDateRange(ownerId: string, startDate: Date, endDate: Date): Promise<EventSelect[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.ownerId, ownerId),
          gte(calendarEvents.start, startDate),
          lte(calendarEvents.start, endDate),
        ),
      )
      .orderBy(calendarEvents.start);
  }

  /**
   * Find events for a specific occurrence
   */
  async findByOccurrenceId(occurrenceId: number): Promise<EventSelect[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.associatedOccurrenceId, occurrenceId))
      .orderBy(calendarEvents.start);
  }

  /**
   * Find event with occurrence and task details
   */
  async findWithDetails(eventId: number) {
    return await db.query.calendarEvents.findFirst({
      where: eq(calendarEvents.id, eventId),
      with: {
        occurrence: {
          with: {
            task: true,
          },
        },
      },
    });
  }

  /**
   * Find all events with details for a specific owner
   */
  async findByOwnerIdWithDetails(ownerId: string) {
    return await db.query.calendarEvents.findMany({
      where: eq(calendarEvents.ownerId, ownerId),
      with: {
        occurrence: {
          with: {
            task: true,
          },
        },
      },
      orderBy: [calendarEvents.start],
    });
  }

  /**
   * Find events with details in a date range
   */
  async findByDateRangeWithDetails(ownerId: string, startDate: Date, endDate: Date) {
    return await db.query.calendarEvents.findMany({
      where: and(
        eq(calendarEvents.ownerId, ownerId),
        gte(calendarEvents.start, startDate),
        lte(calendarEvents.start, endDate),
      ),
      with: {
        occurrence: {
          with: {
            task: true,
          },
        },
      },
      orderBy: [calendarEvents.start],
    });
  }

  /**
   * Find incomplete events for an occurrence
   */
  async findIncompleteByOccurrenceId(occurrenceId: number): Promise<EventSelect[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.associatedOccurrenceId, occurrenceId),
          eq(calendarEvents.isCompleted, false),
        ),
      )
      .orderBy(calendarEvents.start);
  }

  /**
   * Find completed events for specific occurrence IDs with full details
   */
  async findCompletedByOccurrenceIds(occurrenceIds: number[]) {
    if (occurrenceIds.length === 0) return [];
    
    return await db.query.calendarEvents.findMany({
      where: and(
        eq(calendarEvents.isCompleted, true),
        eq(calendarEvents.associatedOccurrenceId, calendarEvents.associatedOccurrenceId),
      ),
      with: {
        occurrence: {
          with: {
            task: {
              with: {
                recurrence: true,
              },
            },
          },
        },
      },
      orderBy: [calendarEvents.start],
    }).then(results => 
      results.filter(event => 
        event.associatedOccurrenceId && occurrenceIds.includes(event.associatedOccurrenceId)
      )
    );
  }
}

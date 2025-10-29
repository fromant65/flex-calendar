/**
 * Calendar Event Router - tRPC router for calendar event operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService } from "../services";

const createCalendarEventSchema = z.object({
  context: z.string().optional(),
  associatedOccurrenceId: z.number().optional(),
  isFixed: z.boolean(),
  start: z.date(),
  finish: z.date(),
});

const updateCalendarEventSchema = z.object({
  context: z.string().optional(),
  isFixed: z.boolean().optional(),
  start: z.date().optional(),
  finish: z.date().optional(),
  isCompleted: z.boolean().optional(),
});

export const calendarEventRouter = createTRPCRouter({
  /**
   * Create a new calendar event
   */
  create: protectedProcedure
    .input(createCalendarEventSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new TaskLifecycleService();
      return await service.createCalendarEvent(ctx.session.user.id, input);
    }),

  /**
   * Get event by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getCalendarEvent(input.id);
    }),

  /**
   * Get event with full details (occurrence, task)
   */
  getWithDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getCalendarEventWithDetailsEnriched(input.id);
    }),

  /**
   * Get all events for the current user
   */
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getUserCalendarEvents(ctx.session.user.id);
    } catch (error) {
      console.error("[Calendar Event Router] Error fetching user events:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Get events with details for the current user
   */
  getMyEventsWithDetails: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getUserCalendarEventsWithDetails(ctx.session.user.id);
    } catch (error) {
      console.error("[Calendar Event Router] Error fetching events with details:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Get events in a date range
   */
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = new TaskLifecycleService();
        return await service.getCalendarEventsByDateRange(
          ctx.session.user.id,
          input.startDate,
          input.endDate
        );
      } catch (error) {
        console.error("[Calendar Event Router] Error fetching events by date range:", error);
        return []; // Return empty array instead of throwing
      }
    }),

  /**
   * Get today's events with details
   */
  getTodayEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getTodayEventsWithDetails(ctx.session.user.id);
    } catch (error) {
      console.error("[Calendar Event Router] Error fetching today's events:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Get this week's events with details
   */
  getWeekEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getWeekEventsWithDetails(ctx.session.user.id);
    } catch (error) {
      console.error("[Calendar Event Router] Error fetching week events:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Update a calendar event
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateCalendarEventSchema,
      })
    )
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.updateCalendarEvent(input.id, input.data);
    }),

  /**
   * Mark event as completed
   */
  complete: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      dedicatedTime: z.number().optional(), // Time in hours
      completeOccurrence: z.boolean().optional(), // Also complete the associated occurrence
      completedAt: z.date().optional() // Custom completion date/time
    }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.completeCalendarEvent(input.id, input.dedicatedTime, input.completeOccurrence, input.completedAt);
    }),

  /**
   * Skip a calendar event
   */
  skip: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      skipOccurrence: z.boolean().optional() // Also skip the associated occurrence
    }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.skipCalendarEvent(input.id, input.skipOccurrence);
    }),

  /**
   * Delete a calendar event
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.deleteCalendarEvent(input.id);
    }),
});

/**
 * Occurrence Router - tRPC router for task occurrence operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService, TaskAnalyticsService } from "../services";

const createOccurrenceSchema = z.object({
  associatedTaskId: z.number(),
  startDate: z.date(),
  limitDate: z.date().optional(),
  targetDate: z.date().optional(),
  targetTimeConsumption: z.number().positive().optional(),
});

const updateOccurrenceSchema = z.object({
  startDate: z.date().optional(),
  limitDate: z.date().optional(),
  targetDate: z.date().optional(),
  targetTimeConsumption: z.number().positive().optional(),
  timeConsumed: z.number().nonnegative().optional(),
  status: z.enum(["Pending", "In Progress", "Completed", "Skipped"]).optional(),
});

export const occurrenceRouter = createTRPCRouter({
  /**
   * Create a new occurrence manually
   */
  create: protectedProcedure
    .input(createOccurrenceSchema)
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.createOccurrence(input);
    }),

  /**
   * Get occurrence by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      const analyticsService = new TaskAnalyticsService();
      const occurrence = await service.getOccurrence(input.id);
      return occurrence ? analyticsService.enrichOccurrenceWithUrgency(occurrence) : undefined;
    }),

  /**
   * Get occurrence with task details
   */
  getWithTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      const analyticsService = new TaskAnalyticsService();
      const occurrence = await service.getOccurrenceWithTask(input.id);
      return occurrence ? analyticsService.enrichOccurrenceWithUrgency(occurrence) : undefined;
    }),

  /**
   * Get all occurrences for a task
   */
  getByTaskId: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      const analyticsService = new TaskAnalyticsService();
      const occurrences = await service.getTaskOccurrences(input.taskId);
      return analyticsService.enrichOccurrencesWithUrgency(occurrences);
    }),

  /**
   * Get occurrences in a date range based on startDate
   */
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      const analyticsService = new TaskAnalyticsService();
      const occurrences = await service.getOccurrencesByDateRange(input.startDate, input.endDate);
      
      console.log("=== DEBUG getByDateRange ===");
      console.log("Total occurrences from DB:", occurrences.length);
      if (occurrences.length > 0) {
        const sample = occurrences[0];
        console.log("Sample occurrence:", {
          id: sample?.id,
          createdAt: sample?.createdAt,
          createdAtType: typeof sample?.createdAt,
          targetDate: sample?.targetDate,
          targetDateType: typeof sample?.targetDate,
          limitDate: sample?.limitDate,
          limitDateType: typeof sample?.limitDate,
        });
      }
      
      const enriched = analyticsService.enrichOccurrencesWithUrgency(occurrences);
      
      console.log("Total enriched:", enriched.length);
      for (const occ of enriched) {
        console.log("Sample enriched urgency:", occ.urgency);
      }
      console.log("=== END DEBUG ===");
      
      return enriched;
    }),
    // TODO - Get by limit and target date
  /**
   * Update an occurrence
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateOccurrenceSchema,
      })
    )
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.updateOccurrence(input.id, input.data);
    }),

  /**
   * Mark occurrence as completed
   */
  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.completeOccurrence(input.id);
    }),

  /**
   * Mark occurrence as skipped
   */
  skip: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.skipOccurrence(input.id);
    }),

  /**
   * Get all occurrences for the current user with task details
   * Useful for task-manager page to show all occurrences grouped by task
   */
  getMyOccurrencesWithTask: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskLifecycleService();
    return await service.getUserOccurrencesWithTask(ctx.session.user.id);
  }),

  /**
   * Get all events associated with a specific occurrence
   */
  getOccurrenceEvents: protectedProcedure
    .input(z.object({ occurrenceId: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getOccurrenceEvents(input.occurrenceId);
    }),
});

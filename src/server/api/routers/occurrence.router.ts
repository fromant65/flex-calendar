/**
 * Occurrence Router - tRPC router for task occurrence operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService } from "../services";

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
      return await service.getOccurrence(input.id);
    }),

  /**
   * Get occurrence with task details
   */
  getWithTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getOccurrenceWithTask(input.id);
    }),

  /**
   * Get all occurrences for a task
   */
  getByTaskId: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getTaskOccurrences(input.taskId);
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
      return await service.getOccurrencesByDateRange(input.startDate, input.endDate);
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
});

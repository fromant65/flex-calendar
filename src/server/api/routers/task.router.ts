/**
 * Task Router - tRPC router for task operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService, TaskAnalyticsService } from "../services";

// Validation schemas
const createRecurrenceSchema = z.object({
  interval: z.number().positive().optional(),
  daysOfWeek: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).optional(),
  daysOfMonth: z.array(z.number().min(1).max(31)).optional(),
  maxOccurrences: z.number().positive().optional(),
  lastPeriodStart: z.date().optional(),
  endDate: z.date().optional(),
});

const createTaskSchema = z.object({
  name: z.string().min(1).max(512),
  description: z.string().optional(),
  importance: z.number().min(1).max(10).optional(),
  targetDate: z.date().optional(),
  limitDate: z.date().optional(),
  targetTimeConsumption: z.number().positive().optional(),
  recurrence: createRecurrenceSchema.optional(),
});

const updateTaskSchema = z.object({
  name: z.string().min(1).max(512).optional(),
  description: z.string().optional(),
  importance: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
});

export const taskRouter = createTRPCRouter({
  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new TaskLifecycleService();
      return await service.createTask(ctx.session.user.id, input);
    }),

  /**
   * Get task by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getTask(input.id);
    }),

  /**
   * Get task with full details (recurrence, next occurrence)
   */
  getWithDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.getTaskWithDetails(input.id);
    }),

  /**
   * Get all tasks for the current user
   */
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskLifecycleService();
    return await service.getUserTasks(ctx.session.user.id);
  }),

  /**
   * Get active tasks for the current user
   */
  getMyActiveTasks: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskLifecycleService();
    return await service.getUserActiveTasks(ctx.session.user.id);
  }),

  /**
   * Update a task
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateTaskSchema,
      })
    )
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.updateTask(input.id, input.data);
    }),

  /**
   * Delete a task (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const service = new TaskLifecycleService();
      return await service.deleteTask(input.id);
    }),

  /**
   * Get task statistics for the current user
   */
  getMyStatistics: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskAnalyticsService();
    return await service.getUserStatistics(ctx.session.user.id);
  }),

  /**
   * Get tasks sorted by urgency
   */
  getByUrgency: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskAnalyticsService();
    return await service.getOccurrencesByUrgency(ctx.session.user.id);
  }),

  /**
   * Get tasks sorted by importance
   */
  getByImportance: protectedProcedure.query(async ({ ctx }) => {
    const service = new TaskAnalyticsService();
    return await service.getOccurrencesByImportance(ctx.session.user.id);
  }),
});

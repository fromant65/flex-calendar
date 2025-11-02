/**
 * Task Router - tRPC router for task operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService, TaskAnalyticsService } from "../services";
import { verifyTaskOwnership } from "../helpers";

// Validation schemas
const createRecurrenceSchema = z.object({
  interval: z.number().positive().optional(),
  daysOfWeek: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).optional(),
  daysOfMonth: z.array(z.number().min(1).max(31)).optional(),
  maxOccurrences: z.number().positive().optional(),
  lastPeriodStart: z.date().optional(),
  endDate: z.date().optional(),
});
// Note: Removed the .refine() validation - specific recurrence type validation
// is now handled in the service layer based on task type

const createTaskSchema = z.object({
  name: z.string().min(1).max(512),
  description: z.string().optional(),
  importance: z.number().min(1).max(10).optional(),
  targetDate: z.date().optional(), // For fixed tasks: start date+time. For others: target/limit date
  limitDate: z.date().optional(), // For fixed tasks: end date+time. For others: limit date
  targetTimeConsumption: z.number().positive().optional(),
  recurrence: createRecurrenceSchema.optional(),
  isFixed: z.boolean().optional(),
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
    .query(async ({ ctx, input }) => {
      // Verify ownership before fetching
      await verifyTaskOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.getTask(input.id);
    }),

  /**
   * Get task with full details (recurrence, next occurrence)
   */
  getWithDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership before fetching
      await verifyTaskOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.getTaskWithDetails(input.id);
    }),

  /**
   * Get all tasks for the current user
   */
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getUserTasks(ctx.session.user.id);
    } catch (error) {
      console.error("[Task Router] Error fetching user tasks:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Get active tasks for the current user
   */
  getMyActiveTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskLifecycleService();
      return await service.getUserActiveTasks(ctx.session.user.id);
    } catch (error) {
      console.error("[Task Router] Error fetching active tasks:", error);
      return []; // Return empty array instead of throwing
    }
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
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before updating
      await verifyTaskOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.updateTask(input.id, input.data);
    }),

  /**
   * Delete a task (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deleting
      await verifyTaskOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.deleteTask(input.id);
    }),

  /**
   * Get task statistics for the current user
   */
  getMyStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskAnalyticsService();
      return await service.getUserStatistics(ctx.session.user.id);
    } catch (error) {
      console.error("[Task Router] Error fetching statistics:", error);
      return {
        totalTasks: 0,
        activeTasks: 0,
        completedOccurrences: 0,
        pendingOccurrences: 0,
        totalTimeSpent: 0,
        averageCompletionRate: 0,
      };
    }
  }),

  /**
   * Get tasks sorted by urgency
   */
  getByUrgency: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskAnalyticsService();
      return await service.getOccurrencesByUrgency(ctx.session.user.id);
    } catch (error) {
      console.error("[Task Router] Error fetching tasks by urgency:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Get tasks sorted by importance
   */
  getByImportance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new TaskAnalyticsService();
      return await service.getOccurrencesByImportance(ctx.session.user.id);
    } catch (error) {
      console.error("[Task Router] Error fetching tasks by importance:", error);
      return []; // Return empty array instead of throwing
    }
  }),

  /**
   * Preview when the next occurrence would be generated for a task
   * Returns null if task has no next occurrence (e.g., única task or last occurrence of finite)
   */
  previewNextOccurrence: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership before previewing
      await verifyTaskOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.previewNextOccurrence(input.id);
    }),
});

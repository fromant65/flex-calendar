/**
 * Occurrence Router - tRPC router for task occurrence operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TaskLifecycleService, TaskAnalyticsService, TaskStreakService } from "../services";
import { verifyOccurrenceOwnership, verifyTaskOwnership } from "../helpers";

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
    .mutation(async ({ ctx, input }) => {
      // Verify that the task belongs to the user
      await verifyTaskOwnership(input.associatedTaskId, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.createOccurrence(input);
    }),

  /**
   * Get occurrence by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership before fetching
      await verifyOccurrenceOwnership(input.id, ctx.session.user.id);
      
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
    .query(async ({ ctx, input }) => {
      // Verify ownership before fetching
      await verifyOccurrenceOwnership(input.id, ctx.session.user.id);
      
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
    .query(async ({ ctx, input }) => {
      // Verify that the task belongs to the user
      await verifyTaskOwnership(input.taskId, ctx.session.user.id);
      
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
    .query(async ({ ctx, input }) => {
      const service = new TaskLifecycleService();
      const analyticsService = new TaskAnalyticsService();
      const occurrences = await service.getOccurrencesByDateRange(
        input.startDate, 
        input.endDate,
        ctx.session.user.id
      );
      
      const enriched = analyticsService.enrichOccurrencesWithUrgency(occurrences);
      
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
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before updating
      await verifyOccurrenceOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.updateOccurrence(input.id, input.data);
    }),

  /**
   * Mark occurrence as completed
   */
  complete: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      completedAt: z.date().optional() // Custom completion date/time
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before completing
      await verifyOccurrenceOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.completeOccurrence(input.id, input.completedAt);
    }),

  /**
   * Mark occurrence as skipped
   */
  skip: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before skipping
      await verifyOccurrenceOwnership(input.id, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      return await service.skipOccurrence(input.id);
    }),

  /**
   * Get all occurrences for the current user with task details
   * Useful for task-manager page to show all occurrences grouped by task
   * Filtering is done on the frontend for better UX (no loading on every keystroke)
   */
  getMyOccurrencesWithTask: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const service = new TaskLifecycleService();
        return await service.getUserOccurrencesWithTask(ctx.session.user.id);
      } catch (error) {
        console.error("[Occurrence Router] Error fetching user occurrences:", error);
        return []; // Return empty array instead of throwing
      }
    }),

  /**
   * Get all events associated with a specific occurrence
   */
  getOccurrenceEvents: protectedProcedure
    .input(z.object({ occurrenceId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify ownership before fetching events
        await verifyOccurrenceOwnership(input.occurrenceId, ctx.session.user.id);
        
        const service = new TaskLifecycleService();
        return await service.getOccurrenceEvents(input.occurrenceId);
      } catch (error) {
        console.error("[Occurrence Router] Error fetching occurrence events:", error);
        throw error; // Re-throw to properly handle FORBIDDEN/NOT_FOUND errors
      }
    }),

  /**
   * Detect backlog for a task
   * Returns information about pending occurrences that are in the past
   */
  detectBacklog: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify that the task belongs to the user
        await verifyTaskOwnership(input.taskId, ctx.session.user.id);
        
        const service = new TaskLifecycleService();
        return await service.detectBacklog(input.taskId);
      } catch (error) {
        console.error("[Occurrence Router] Error detecting backlog:", error);
        throw error; // Re-throw to properly handle FORBIDDEN/NOT_FOUND errors
      }
    }),

  /**
   * Skip all backlog occurrences that are overdue
   * Also generates missing occurrences up to today
   */
  skipBacklog: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify that the task belongs to the user
      await verifyTaskOwnership(input.taskId, ctx.session.user.id);
      
      const service = new TaskLifecycleService();
      const result = await service.skipBacklogOccurrences(input.taskId);
      return { 
        success: true, 
        skippedCount: result.skippedCount,
        createdCount: result.createdCount
      };
    }),

  /**
   * Get completion streak for a specific task
   * Returns current streak, total completed, and completion rate
   */
  getTaskStreak: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify that the task belongs to the user
        await verifyTaskOwnership(input.taskId, ctx.session.user.id);
        
        const streakService = new TaskStreakService();
        return await streakService.getTaskStreak(input.taskId);
      } catch (error) {
        console.error("[Occurrence Router] Error fetching task streak:", error);
        throw error; // Re-throw to properly handle FORBIDDEN/NOT_FOUND errors
      }
    }),

  /**
   * Get completion streaks for multiple tasks
   * Returns a map of task ID to streak info
   */
  getTaskStreaks: protectedProcedure
    .input(z.object({ taskIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      try {
        const streakService = new TaskStreakService();
        const streaksMap = await streakService.getTaskStreaks(input.taskIds);
        // Convert Map to object for JSON serialization
        return Object.fromEntries(streaksMap);
      } catch (error) {
        console.error("[Occurrence Router] Error fetching task streaks:", error);
        return {}; // Return empty object instead of throwing
      }
    }),

  /**
   * Get completion streaks for all user's tasks
   */
  getUserTaskStreaks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const streakService = new TaskStreakService();
      return await streakService.getUserTaskStreaks(ctx.session.user.id);
    } catch (error) {
      console.error("[Occurrence Router] Error fetching task streaks:", error);
      return []; // Return empty array instead of throwing
    }
  }),
});

/**
 * Statistics Router - tRPC router for statistics operations
 * Provides granular endpoints for different statistics sections
 */

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { StatisticsService } from "../services";

export const statsRouter = createTRPCRouter({
  /**
   * Get all statistics for the current user (legacy endpoint)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getAllStatistics(ctx.session.user.id);
  }),

  /**
   * Get task statistics only
   */
  getTaskStats: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getTaskStats(ctx.session.user.id);
  }),

  /**
   * Get recurrence/habit statistics only
   */
  getRecurrenceStats: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getRecurrenceStats(ctx.session.user.id);
  }),

  /**
   * Get occurrence statistics only
   */
  getOccurrenceStats: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getOccurrenceStats(ctx.session.user.id);
  }),

  /**
   * Get calendar statistics only
   */
  getCalendarStats: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getCalendarStats(ctx.session.user.id);
  }),

  /**
   * Get global KPIs only
   */
  getGlobalKPIs: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getGlobalKPIs(ctx.session.user.id);
  }),

  /**
   * Get advanced insights only
   */
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    const service = new StatisticsService();
    return await service.getInsights(ctx.session.user.id);
  }),
});


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
    try {
      const service = new StatisticsService();
      return await service.getAllStatistics(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching all statistics:", error);
      // Return minimal stats structure instead of throwing
      return {
        taskStats: { totalTasks: 0, activeTasks: 0, completedTasks: 0, importanceDistribution: [], completionRateByImportance: [], taskTypeDistribution: { fixed: 0, flexible: 0 } },
        recurrenceStats: { habitCompliance: [], maxStreak: 0, currentStreak: 0, completionByDayOfWeek: [] },
        occurrenceStats: { occurrencesByPeriod: [], statusDistribution: { pending: 0, inProgress: 0, completed: 0, skipped: 0 }, averageTimeDeviation: null, averageUrgency: null, averageResolutionTime: null },
        calendarStats: { totalEvents: 0, completedEvents: 0, totalDedicatedTime: 0, averageEventDuration: 0 },
        globalKPIs: { productivityScore: 0, consistencyScore: 0, efficiencyScore: 0 },
        insights: { taskInsights: { completionRateAnalysis: "", importanceAnalysis: "", recommendation: "" }, recurrenceInsights: { complianceAnalysis: "", evolutionAnalysis: "", recommendation: "" }, occurrenceInsights: { resolutionTimeAnalysis: "", timeDeviationAnalysis: "", recommendation: "" } },
      };
    }
  }),

  /**
   * Get task statistics only
   */
  getTaskStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getTaskStats(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching task stats:", error);
      return { 
        averageCompletionTime: null,
        importanceDistribution: [], 
        fixedVsFlexible: { fixed: 0, flexible: 0 },
        recurringVsUnique: { recurring: 0, unique: 0 }
      };
    }
  }),

  /**
   * Get recurrence/habit statistics only
   */
  getRecurrenceStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getRecurrenceStats(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching recurrence stats:", error);
      return { 
        habitCompliance: [], 
        maxStreak: 0, 
        currentStreak: 0, 
        frequentDays: [] 
      };
    }
  }),

  /**
   * Get occurrence statistics only
   */
  getOccurrenceStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getOccurrenceStats(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching occurrence stats:", error);
      return { 
        occurrencesByPeriod: [], 
        statusDistribution: { pending: 0, inProgress: 0, completed: 0, skipped: 0 }, 
        averageTimeDeviation: null, 
        averageUrgency: null, 
        averageResolutionTime: null 
      };
    }
  }),

  /**
   * Get calendar statistics only
   */
  getCalendarStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getCalendarStats(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching calendar stats:", error);
      return { 
        completedVsIncomplete: { completed: 0, incomplete: 0 },
        hourlyDistribution: [], 
        complianceRate: 0 
      };
    }
  }),

  /**
   * Get global KPIs only
   */
  getGlobalKPIs: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getGlobalKPIs(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching global KPIs:", error);
      return { 
        completionRate: 0, 
        totalTimeInvested: 0,
        planningEfficiency: null,
        averageWorkload: { hoursPerDay: 0, hoursPerWeek: 0 },
        importanceBalance: { lowImportanceCompletionRate: 0, mediumImportanceCompletionRate: 0, highImportanceCompletionRate: 0 },
        urgencyBalance: { earlyCompletionRate: 0, onTimeCompletionRate: 0, lateCompletionRate: 0 }
      };
    }
  }),

  /**
   * Get advanced insights only
   */
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const service = new StatisticsService();
      return await service.getInsights(ctx.session.user.id);
    } catch (error) {
      console.error("[Stats Router] Error fetching insights:", error);
      return { 
        lowComplianceHabits: [],
        completionTrend: [],
        recurringVsUniqueComparison: { recurringCompletionRate: 0, uniqueCompletionRate: 0 },
        bottlenecks: []
      };
    }
  }),
});


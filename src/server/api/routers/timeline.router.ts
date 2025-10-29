/**
 * Timeline Router - tRPC router for timeline data operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TimelineService } from "../services";

export const timelineRouter = createTRPCRouter({
  /**
   * Get timeline data for a user within a date range
   * Returns tasks, occurrences, and events that have been completed
   */
  getTimelineData: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const service = new TimelineService();
        return await service.getTimelineData(
          ctx.session.user.id,
          input.startDate,
          input.endDate
        );
      } catch (error) {
        console.error("[Timeline Router] Error fetching timeline data:", error);
        return { occurrences: [], events: [] }; // Return empty timeline instead of throwing
      }
    }),
});

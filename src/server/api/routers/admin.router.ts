/**
 * Admin Router - tRPC endpoints for admin operations
 */

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { AdminService } from "../services/admin.service";

const adminService = new AdminService();

export const adminRouter = createTRPCRouter({
  /**
   * Get global statistics for a date range
   */
  getGlobalStats: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await adminService.getGlobalStatistics({
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  /**
   * Get statistics for all users with activity in the date range
   */
  getUserActivityStats: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await adminService.getUserActivityStatistics({
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  /**
   * Get detailed statistics for a specific user
   */
  getUserDetailStats: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await adminService.getUserDetailStatistics({
        userId: input.userId,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  /**
   * Get total and active user counts
   */
  getUserCounts: adminProcedure.query(async () => {
    return await adminService.getUserCounts();
  }),

  /**
   * Get all users with their statistics
   */
  getAllUsersWithStats: adminProcedure.query(async () => {
    return await adminService.getAllUsersWithStatistics();
  }),
});

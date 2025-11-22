/**
 * Notifications Router - tRPC endpoints for notification operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { NotificationsService } from "../services/notifications.service";

const notificationsService = new NotificationsService();

export const notificationsRouter = createTRPCRouter({
  // Admin endpoints

  /**
   * Create a new notification (Admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        description: z.string().min(1),
        isActive: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return await notificationsService.createNotification({
        title: input.title,
        description: input.description,
        isActive: input.isActive,
      });
    }),

  /**
   * Update an existing notification (Admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(256).optional(),
        description: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await notificationsService.updateNotification({
        id: input.id,
        title: input.title,
        description: input.description,
        isActive: input.isActive,
      });
    }),

  /**
   * Delete a notification (Admin only)
   */
  delete: adminProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await notificationsService.deleteNotification(input.id);
    }),

  /**
   * Get all notifications (Admin only)
   */
  getAll: adminProcedure.query(async () => {
    return await notificationsService.getAllNotifications();
  }),

  /**
   * Get active notifications (Admin only)
   */
  getActive: adminProcedure.query(async () => {
    return await notificationsService.getActiveNotifications();
  }),

  /**
   * Toggle notification active status (Admin only)
   */
  toggleStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await notificationsService.toggleNotificationStatus({
        id: input.id,
        isActive: input.isActive,
      });
    }),

  // User endpoints

  /**
   * Get all notifications for the current user with read status
   */
  getForUser: protectedProcedure.query(async ({ ctx }) => {
    return await notificationsService.getNotificationsForUser({
      userId: ctx.session.user.id,
    });
  }),

  /**
   * Get unread notifications for the current user
   */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    return await notificationsService.getUnreadNotifications({
      userId: ctx.session.user.id,
    });
  }),

  /**
   * Get count of unread notifications for the current user
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await notificationsService.getUnreadCount(ctx.session.user.id);
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationsService.markNotificationAsRead({
        notificationId: input.notificationId,
        userId: ctx.session.user.id,
      });
      return { success: true };
    }),

  /**
   * Mark a notification as unread
   */
  markAsUnread: protectedProcedure
    .input(
      z.object({
        notificationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const success = await notificationsService.markNotificationAsUnread({
        notificationId: input.notificationId,
        userId: ctx.session.user.id,
      });
      return { success };
    }),

  /**
   * Get notification by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await notificationsService.getNotificationById(input.id);
    }),
});

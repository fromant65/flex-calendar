/**
 * Notifications Repository - handles database queries for notifications
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { notifications, notificationsUsers } from "~/server/db/schema";
import { db } from "~/server/db";
import { BaseRepository } from "./base.repository";

export class NotificationsRepository extends BaseRepository<typeof notifications> {
  constructor() {
    super(notifications);
  }

  /**
   * Get all active notifications ordered by creation date (newest first)
   */
  async getActiveNotifications() {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.isActive, true))
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Get all notifications (both active and inactive) ordered by creation date (newest first)
   */
  async getAllNotifications() {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Toggle notification active status
   */
  async toggleActiveStatus(id: number, isActive: boolean) {
    const [result] = await db
      .update(notifications)
      .set({ isActive })
      .where(eq(notifications.id, id))
      .returning();
    return result;
  }

  /**
   * Mark notification as read for a specific user
   */
  async markAsRead(notificationId: number, userId: string) {
    const [result] = await db
      .insert(notificationsUsers)
      .values({
        notificationId,
        userId,
        readAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();
    return result;
  }

  /**
   * Mark notification as unread for a specific user (remove from read list)
   */
  async markAsUnread(notificationId: number, userId: string) {
    const result = await db
      .delete(notificationsUsers)
      .where(
        and(
          eq(notificationsUsers.notificationId, notificationId),
          eq(notificationsUsers.userId, userId)
        )
      );
    return (result as any).rowCount > 0;
  }

  /**
   * Get all active notifications for a user with read status
   */
  async getNotificationsForUser(userId: string) {
    return await db
      .select({
        id: notifications.id,
        title: notifications.title,
        description: notifications.description,
        isActive: notifications.isActive,
        createdAt: notifications.createdAt,
        readAt: notificationsUsers.readAt,
      })
      .from(notifications)
      .leftJoin(
        notificationsUsers,
        and(
          eq(notifications.id, notificationsUsers.notificationId),
          eq(notificationsUsers.userId, userId)
        )
      )
      .where(eq(notifications.isActive, true))
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string) {
    const allNotifications = await this.getNotificationsForUser(userId);
    return allNotifications.filter((n) => n.readAt === null);
  }

  /**
   * Check if a notification is read by a user
   */
  async isNotificationRead(notificationId: number, userId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(notificationsUsers)
      .where(
        and(
          eq(notificationsUsers.notificationId, notificationId),
          eq(notificationsUsers.userId, userId)
        )
      );
    return !!result;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number) {
    const [result] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return result;
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    return unreadNotifications.length;
  }
}

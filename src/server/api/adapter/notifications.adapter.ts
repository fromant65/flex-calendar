/**
 * Notifications Adapter - connects service layer with repository layer for notifications
 */

import { NotificationsRepository } from "../repository/notifications.repository";
import type {
  Notification,
  NotificationWithReadStatus,
  CreateNotificationDTO,
  UpdateNotificationDTO,
} from "../services/types";

export class NotificationsAdapter {
  private notificationsRepo: NotificationsRepository;

  constructor() {
    this.notificationsRepo = new NotificationsRepository();
  }

  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await this.notificationsRepo.create({
      title: data.title,
      description: data.description,
      isActive: data.isActive ?? true,
    });

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt?.toISOString() ?? null,
    };
  }

  /**
   * Update an existing notification
   */
  async updateNotification(id: number, data: UpdateNotificationDTO): Promise<Notification | null> {
    const notification = await this.notificationsRepo.updateById(id, data);
    if (!notification) return null;

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt?.toISOString() ?? null,
    };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<boolean> {
    return await this.notificationsRepo.deleteById(id);
  }

  /**
   * Get all notifications (for admin)
   */
  async getAllNotifications(): Promise<Notification[]> {
    const notifications = await this.notificationsRepo.getAllNotifications();
    return notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt?.toISOString() ?? null,
    }));
  }

  /**
   * Get active notifications (for admin)
   */
  async getActiveNotifications(): Promise<Notification[]> {
    const notifications = await this.notificationsRepo.getActiveNotifications();
    return notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt?.toISOString() ?? null,
    }));
  }

  /**
   * Toggle notification active status
   */
  async toggleNotificationStatus(id: number, isActive: boolean): Promise<Notification | null> {
    const notification = await this.notificationsRepo.toggleActiveStatus(id, isActive);
    if (!notification) return null;

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt?.toISOString() ?? null,
    };
  }

  /**
   * Get notifications for a specific user with read status
   */
  async getNotificationsForUser(userId: string): Promise<NotificationWithReadStatus[]> {
    const notifications = await this.notificationsRepo.getNotificationsForUser(userId);
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      isActive: n.isActive,
      createdAt: n.createdAt.toISOString(),
      isRead: n.readAt !== null,
      readAt: n.readAt?.toISOString() ?? null,
    }));
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<NotificationWithReadStatus[]> {
    const notifications = await this.notificationsRepo.getUnreadNotifications(userId);
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      isActive: n.isActive,
      createdAt: n.createdAt.toISOString(),
      isRead: false,
      readAt: null,
    }));
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: string): Promise<void> {
    await this.notificationsRepo.markAsRead(notificationId, userId);
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: number, userId: string): Promise<boolean> {
    return await this.notificationsRepo.markAsUnread(notificationId, userId);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<Notification | null> {
    const notification = await this.notificationsRepo.getNotificationById(id);
    if (!notification) return null;

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt?.toISOString() ?? null,
    };
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepo.getUnreadCount(userId);
  }
}

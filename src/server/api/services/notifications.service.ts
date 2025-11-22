/**
 * Notifications Service - Business logic for notification operations
 */

import { NotificationsAdapter } from "../adapter";
import type {
  Notification,
  NotificationWithReadStatus,
  CreateNotificationDTO,
  UpdateNotificationDTO,
} from "./types";

export interface CreateNotificationInput {
  title: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateNotificationInput {
  id: number;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface ToggleNotificationStatusInput {
  id: number;
  isActive: boolean;
}

export interface MarkNotificationInput {
  notificationId: number;
  userId: string;
}

export interface GetNotificationsForUserInput {
  userId: string;
}

export interface GetUnreadNotificationsInput {
  userId: string;
}

export class NotificationsService {
  private adapter: NotificationsAdapter;

  constructor(adapter?: NotificationsAdapter) {
    this.adapter = adapter ?? new NotificationsAdapter();
  }

  /**
   * Create a new notification (Admin only)
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await this.adapter.createNotification({
      title: input.title,
      description: input.description,
      isActive: input.isActive ?? true,
    });

    return notification;
  }

  /**
   * Update an existing notification (Admin only)
   */
  async updateNotification(input: UpdateNotificationInput): Promise<Notification> {
    const notification = await this.adapter.updateNotification(input.id, {
      title: input.title,
      description: input.description,
      isActive: input.isActive,
    });

    if (!notification) {
      throw new Error(`Notification with id ${input.id} not found`);
    }

    return notification;
  }

  /**
   * Delete a notification (Admin only)
   */
  async deleteNotification(id: number): Promise<boolean> {
    const deleted = await this.adapter.deleteNotification(id);

    if (!deleted) {
      throw new Error(`Notification with id ${id} not found`);
    }

    return true;
  }

  /**
   * Get all notifications (Admin only)
   */
  async getAllNotifications(): Promise<Notification[]> {
    return await this.adapter.getAllNotifications();
  }

  /**
   * Get active notifications (Admin only)
   */
  async getActiveNotifications(): Promise<Notification[]> {
    return await this.adapter.getActiveNotifications();
  }

  /**
   * Toggle notification active status (Admin only)
   */
  async toggleNotificationStatus(input: ToggleNotificationStatusInput): Promise<Notification> {
    const notification = await this.adapter.toggleNotificationStatus(input.id, input.isActive);

    if (!notification) {
      throw new Error(`Notification with id ${input.id} not found`);
    }

    return notification;
  }

  /**
   * Get all notifications for a user with read status
   */
  async getNotificationsForUser(
    input: GetNotificationsForUserInput
  ): Promise<NotificationWithReadStatus[]> {
    return await this.adapter.getNotificationsForUser(input.userId);
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(
    input: GetUnreadNotificationsInput
  ): Promise<NotificationWithReadStatus[]> {
    return await this.adapter.getUnreadNotifications(input.userId);
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(input: MarkNotificationInput): Promise<void> {
    await this.adapter.markAsRead(input.notificationId, input.userId);
  }

  /**
   * Mark a notification as unread
   */
  async markNotificationAsUnread(input: MarkNotificationInput): Promise<boolean> {
    return await this.adapter.markAsUnread(input.notificationId, input.userId);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.adapter.getNotificationById(id);

    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }

    return notification;
  }

  /**
   * Get count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.adapter.getUnreadCount(userId);
  }
}

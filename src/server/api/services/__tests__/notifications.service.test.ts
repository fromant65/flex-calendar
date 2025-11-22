/**
 * Notifications Service Tests - validates business logic for notification operations
 */

import "./mocks";
import { NotificationsService } from "../notifications.service";
import type { NotificationsAdapter } from "../../adapter";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let mockAdapter: jest.Mocked<NotificationsAdapter>;

  beforeEach(() => {
    service = new NotificationsService();
    mockAdapter = (service as any).adapter as jest.Mocked<NotificationsAdapter>;

    // Ensure all methods are mocked
    mockAdapter.createNotification = mockAdapter.createNotification ?? jest.fn();
    mockAdapter.updateNotification = mockAdapter.updateNotification ?? jest.fn();
    mockAdapter.deleteNotification = mockAdapter.deleteNotification ?? jest.fn();
    mockAdapter.getAllNotifications = mockAdapter.getAllNotifications ?? jest.fn();
    mockAdapter.getActiveNotifications = mockAdapter.getActiveNotifications ?? jest.fn();
    mockAdapter.toggleNotificationStatus = mockAdapter.toggleNotificationStatus ?? jest.fn();
    mockAdapter.getNotificationsForUser = mockAdapter.getNotificationsForUser ?? jest.fn();
    mockAdapter.getUnreadNotifications = mockAdapter.getUnreadNotifications ?? jest.fn();
    mockAdapter.markAsRead = mockAdapter.markAsRead ?? jest.fn();
    mockAdapter.markAsUnread = mockAdapter.markAsUnread ?? jest.fn();
    mockAdapter.getNotificationById = mockAdapter.getNotificationById ?? jest.fn();
    mockAdapter.getUnreadCount = mockAdapter.getUnreadCount ?? jest.fn();

    jest.clearAllMocks();
  });

  describe("createNotification", () => {
    it("should create a new notification with default active status", async () => {
      // Arrange
      const input = {
        title: "New Feature",
        description: "We have launched a new feature!",
      };

      const mockNotification = {
        id: 1,
        title: input.title,
        description: input.description,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: null,
      };

      (mockAdapter.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.createNotification(input);

      // Assert
      expect(result).toEqual(mockNotification);
      expect(mockAdapter.createNotification).toHaveBeenCalledWith({
        title: input.title,
        description: input.description,
        isActive: true,
      });
    });

    it("should create a notification with specified active status", async () => {
      // Arrange
      const input = {
        title: "Draft Notification",
        description: "This is a draft",
        isActive: false,
      };

      const mockNotification = {
        id: 1,
        title: input.title,
        description: input.description,
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: null,
      };

      (mockAdapter.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.createNotification(input);

      // Assert
      expect(result).toEqual(mockNotification);
      expect(mockAdapter.createNotification).toHaveBeenCalledWith({
        title: input.title,
        description: input.description,
        isActive: false,
      });
    });
  });

  describe("updateNotification", () => {
    it("should update an existing notification", async () => {
      // Arrange
      const input = {
        id: 1,
        title: "Updated Title",
        description: "Updated description",
      };

      const mockNotification = {
        id: 1,
        title: input.title,
        description: input.description,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      (mockAdapter.updateNotification as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.updateNotification(input);

      // Assert
      expect(result).toEqual(mockNotification);
      expect(mockAdapter.updateNotification).toHaveBeenCalledWith(input.id, {
        title: input.title,
        description: input.description,
        isActive: undefined,
      });
    });

    it("should throw error if notification not found", async () => {
      // Arrange
      const input = {
        id: 999,
        title: "Updated Title",
      };

      (mockAdapter.updateNotification as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateNotification(input)).rejects.toThrow(
        "Notification with id 999 not found"
      );
    });
  });

  describe("deleteNotification", () => {
    it("should delete a notification successfully", async () => {
      // Arrange
      const notificationId = 1;
      (mockAdapter.deleteNotification as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.deleteNotification(notificationId);

      // Assert
      expect(result).toBe(true);
      expect(mockAdapter.deleteNotification).toHaveBeenCalledWith(notificationId);
    });

    it("should throw error if notification not found", async () => {
      // Arrange
      const notificationId = 999;
      (mockAdapter.deleteNotification as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.deleteNotification(notificationId)).rejects.toThrow(
        "Notification with id 999 not found"
      );
    });
  });

  describe("getAllNotifications", () => {
    it("should return all notifications", async () => {
      // Arrange
      const mockNotifications = [
        {
          id: 1,
          title: "Notification 1",
          description: "Description 1",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: null,
        },
        {
          id: 2,
          title: "Notification 2",
          description: "Description 2",
          isActive: false,
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: null,
        },
      ];

      (mockAdapter.getAllNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      // Act
      const result = await service.getAllNotifications();

      // Assert
      expect(result).toEqual(mockNotifications);
      expect(mockAdapter.getAllNotifications).toHaveBeenCalled();
    });
  });

  describe("getActiveNotifications", () => {
    it("should return only active notifications", async () => {
      // Arrange
      const mockNotifications = [
        {
          id: 1,
          title: "Active Notification",
          description: "Description",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: null,
        },
      ];

      (mockAdapter.getActiveNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      // Act
      const result = await service.getActiveNotifications();

      // Assert
      expect(result).toEqual(mockNotifications);
      expect(mockAdapter.getActiveNotifications).toHaveBeenCalled();
    });
  });

  describe("toggleNotificationStatus", () => {
    it("should toggle notification to active", async () => {
      // Arrange
      const input = { id: 1, isActive: true };
      const mockNotification = {
        id: 1,
        title: "Notification",
        description: "Description",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      (mockAdapter.toggleNotificationStatus as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.toggleNotificationStatus(input);

      // Assert
      expect(result).toEqual(mockNotification);
      expect(mockAdapter.toggleNotificationStatus).toHaveBeenCalledWith(input.id, input.isActive);
    });

    it("should toggle notification to inactive", async () => {
      // Arrange
      const input = { id: 1, isActive: false };
      const mockNotification = {
        id: 1,
        title: "Notification",
        description: "Description",
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      (mockAdapter.toggleNotificationStatus as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.toggleNotificationStatus(input);

      // Assert
      expect(result).toEqual(mockNotification);
    });

    it("should throw error if notification not found", async () => {
      // Arrange
      const input = { id: 999, isActive: true };
      (mockAdapter.toggleNotificationStatus as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.toggleNotificationStatus(input)).rejects.toThrow(
        "Notification with id 999 not found"
      );
    });
  });

  describe("getNotificationsForUser", () => {
    it("should return all notifications for a user with read status", async () => {
      // Arrange
      const userId = "user123";
      const mockNotifications = [
        {
          id: 1,
          title: "Notification 1",
          description: "Description 1",
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          isRead: true,
          readAt: "2024-01-01T12:00:00.000Z",
        },
        {
          id: 2,
          title: "Notification 2",
          description: "Description 2",
          isActive: true,
          createdAt: "2024-01-02T00:00:00.000Z",
          isRead: false,
          readAt: null,
        },
      ];

      (mockAdapter.getNotificationsForUser as jest.Mock).mockResolvedValue(mockNotifications);

      // Act
      const result = await service.getNotificationsForUser({ userId });

      // Assert
      expect(result).toEqual(mockNotifications);
      expect(mockAdapter.getNotificationsForUser).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUnreadNotifications", () => {
    it("should return only unread notifications for a user", async () => {
      // Arrange
      const userId = "user123";
      const mockNotifications = [
        {
          id: 2,
          title: "Unread Notification",
          description: "Description",
          isActive: true,
          createdAt: "2024-01-02T00:00:00.000Z",
          isRead: false,
          readAt: null,
        },
      ];

      (mockAdapter.getUnreadNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      // Act
      const result = await service.getUnreadNotifications({ userId });

      // Assert
      expect(result).toEqual(mockNotifications);
      expect(mockAdapter.getUnreadNotifications).toHaveBeenCalledWith(userId);
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark a notification as read", async () => {
      // Arrange
      const input = { notificationId: 1, userId: "user123" };
      (mockAdapter.markAsRead as jest.Mock).mockResolvedValue(undefined);

      // Act
      await service.markNotificationAsRead(input);

      // Assert
      expect(mockAdapter.markAsRead).toHaveBeenCalledWith(input.notificationId, input.userId);
    });
  });

  describe("markNotificationAsUnread", () => {
    it("should mark a notification as unread", async () => {
      // Arrange
      const input = { notificationId: 1, userId: "user123" };
      (mockAdapter.markAsUnread as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.markNotificationAsUnread(input);

      // Assert
      expect(result).toBe(true);
      expect(mockAdapter.markAsUnread).toHaveBeenCalledWith(input.notificationId, input.userId);
    });
  });

  describe("getNotificationById", () => {
    it("should return a notification by id", async () => {
      // Arrange
      const notificationId = 1;
      const mockNotification = {
        id: 1,
        title: "Notification",
        description: "Description",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: null,
      };

      (mockAdapter.getNotificationById as jest.Mock).mockResolvedValue(mockNotification);

      // Act
      const result = await service.getNotificationById(notificationId);

      // Assert
      expect(result).toEqual(mockNotification);
      expect(mockAdapter.getNotificationById).toHaveBeenCalledWith(notificationId);
    });

    it("should throw error if notification not found", async () => {
      // Arrange
      const notificationId = 999;
      (mockAdapter.getNotificationById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.getNotificationById(notificationId)).rejects.toThrow(
        "Notification with id 999 not found"
      );
    });
  });

  describe("getUnreadCount", () => {
    it("should return count of unread notifications", async () => {
      // Arrange
      const userId = "user123";
      (mockAdapter.getUnreadCount as jest.Mock).mockResolvedValue(5);

      // Act
      const result = await service.getUnreadCount(userId);

      // Assert
      expect(result).toBe(5);
      expect(mockAdapter.getUnreadCount).toHaveBeenCalledWith(userId);
    });

    it("should return 0 when no unread notifications", async () => {
      // Arrange
      const userId = "user123";
      (mockAdapter.getUnreadCount as jest.Mock).mockResolvedValue(0);

      // Act
      const result = await service.getUnreadCount(userId);

      // Assert
      expect(result).toBe(0);
    });
  });
});

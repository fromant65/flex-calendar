/**
 * Admin Service Tests - validates business logic for admin operations
 */

import './mocks';
import { AdminService } from '../admin.service';
import type { AdminAdapter } from '../../adapter';

describe("AdminService", () => {
  let service: AdminService;
  let mockAdapter: jest.Mocked<AdminAdapter>;

  beforeEach(() => {
    service = new AdminService();
    mockAdapter = (service as any).adapter as jest.Mocked<AdminAdapter>;
    
    // Ensure all methods are mocked
    mockAdapter.getGlobalStats = mockAdapter.getGlobalStats ?? jest.fn();
    mockAdapter.getUsersWithActivity = mockAdapter.getUsersWithActivity ?? jest.fn();
    mockAdapter.getUserStats = mockAdapter.getUserStats ?? jest.fn();
    mockAdapter.getAllUsers = mockAdapter.getAllUsers ?? jest.fn();
    mockAdapter.getUserCounts = mockAdapter.getUserCounts ?? jest.fn();
    
    jest.clearAllMocks();
  });

  describe("getGlobalStatistics", () => {
    it("should return correct global statistics for a date range", async () => {
      // Arrange
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockGlobalStats = {
        tasksCreated: [{ id: 1 }, { id: 2 }, { id: 3 }],
        occurrencesCreated: [{ id: 1 }, { id: 2 }],
        eventsCreated: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        completedOccurrences: [{ id: 1 }],
        completedEvents: [{ id: 1 }, { id: 2 }],
        totalUsers: 10,
        activeUsers: 5,
      };

      (mockAdapter.getGlobalStats as jest.Mock).mockResolvedValue(mockGlobalStats);

      // Act
      const result = await service.getGlobalStatistics({ startDate, endDate });

      // Assert
      expect(result).toEqual({
        totalTasksCreated: 3,
        totalOccurrencesCreated: 2,
        totalEventsCreated: 4,
        totalOccurrencesCompleted: 1,
        totalEventsCompleted: 2,
        totalUsers: 10,
        activeUsers: 5,
      });

      expect(mockAdapter.getGlobalStats).toHaveBeenCalledWith(startDate, endDate);
    });

    it("should handle empty results correctly", async () => {
      // Arrange
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockGlobalStats = {
        tasksCreated: [],
        occurrencesCreated: [],
        eventsCreated: [],
        completedOccurrences: [],
        completedEvents: [],
        totalUsers: 0,
        activeUsers: 0,
      };

      (mockAdapter.getGlobalStats as jest.Mock).mockResolvedValue(mockGlobalStats);

      // Act
      const result = await service.getGlobalStatistics({ startDate, endDate });

      // Assert
      expect(result).toEqual({
        totalTasksCreated: 0,
        totalOccurrencesCreated: 0,
        totalEventsCreated: 0,
        totalOccurrencesCompleted: 0,
        totalEventsCompleted: 0,
        totalUsers: 0,
        activeUsers: 0,
      });
    });
  });

  describe("getUserActivityStatistics", () => {
    it("should return statistics for all users with activity", async () => {
      // Arrange
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockUsers = [
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com" },
      ];

      const mockUser1Stats = {
        tasksCreated: [{ id: 1 }, { id: 2 }],
        completedOccurrences: [{ id: 1 }],
        completedEvents: [{ id: 1 }, { id: 2 }],
      };

      const mockUser2Stats = {
        tasksCreated: [{ id: 3 }],
        completedOccurrences: [{ id: 2 }, { id: 3 }],
        completedEvents: [],
      };

      (mockAdapter.getUsersWithActivity as jest.Mock).mockResolvedValue(mockUsers);
      (mockAdapter.getUserStats as jest.Mock)
        .mockResolvedValueOnce(mockUser1Stats)
        .mockResolvedValueOnce(mockUser2Stats);

      // Act
      const result = await service.getUserActivityStatistics({ startDate, endDate });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: "user1",
        userName: "John Doe",
        userEmail: "john@example.com",
        tasksCreated: 2,
        occurrencesCompleted: 1,
        eventsCompleted: 2,
      });
      expect(result[1]).toEqual({
        userId: "user2",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        tasksCreated: 1,
        occurrencesCompleted: 2,
        eventsCompleted: 0,
      });

      expect(mockAdapter.getUsersWithActivity).toHaveBeenCalledWith(startDate, endDate);
      expect(mockAdapter.getUserStats).toHaveBeenCalledTimes(2);
    });

    it("should handle users with no name", async () => {
      // Arrange
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockUsers = [{ id: "user1", name: null, email: "user@example.com" }];

      const mockUserStats = {
        tasksCreated: [{ id: 1 }],
        completedOccurrences: [],
        completedEvents: [],
      };

      (mockAdapter.getUsersWithActivity as jest.Mock).mockResolvedValue(mockUsers);
      (mockAdapter.getUserStats as jest.Mock).mockResolvedValue(mockUserStats);

      // Act
      const result = await service.getUserActivityStatistics({ startDate, endDate });

      // Assert
      expect(result[0]?.userName).toBeNull();
    });

    it("should return empty array when no users have activity", async () => {
      // Arrange
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      (mockAdapter.getUsersWithActivity as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.getUserActivityStatistics({ startDate, endDate });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getUserDetailStatistics", () => {
    it("should return detailed statistics for a specific user", async () => {
      // Arrange
      const userId = "user1";
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockUserStats = {
        tasksCreated: [{ id: 1 }, { id: 2 }, { id: 3 }],
        completedOccurrences: [{ id: 1 }, { id: 2 }],
        completedEvents: [{ id: 1 }],
      };

      const mockAllUsers = [
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com" },
      ];

      (mockAdapter.getUserStats as jest.Mock).mockResolvedValue(mockUserStats);
      (mockAdapter.getAllUsers as jest.Mock).mockResolvedValue(mockAllUsers);

      // Act
      const result = await service.getUserDetailStatistics({ userId, startDate, endDate });

      // Assert
      expect(result).toEqual({
        userId: "user1",
        userName: "John Doe",
        userEmail: "john@example.com",
        tasksCreated: 3,
        occurrencesCompleted: 2,
        eventsCompleted: 1,
      });

      expect(mockAdapter.getUserStats).toHaveBeenCalledWith(userId, startDate, endDate);
      expect(mockAdapter.getAllUsers).toHaveBeenCalled();
    });

    it("should handle user not found gracefully", async () => {
      // Arrange
      const userId = "nonexistent";
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const mockUserStats = {
        tasksCreated: [],
        completedOccurrences: [],
        completedEvents: [],
      };

      (mockAdapter.getUserStats as jest.Mock).mockResolvedValue(mockUserStats);
      (mockAdapter.getAllUsers as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.getUserDetailStatistics({ userId, startDate, endDate });

      // Assert
      expect(result).toEqual({
        userId: "nonexistent",
        userName: null,
        userEmail: "unknown",
        tasksCreated: 0,
        occurrencesCompleted: 0,
        eventsCompleted: 0,
      });
    });
  });

  describe("getUserCounts", () => {
    it("should return total and active user counts", async () => {
      // Arrange
      const mockCounts = {
        totalUsers: 100,
        activeUsers: 45,
      };

      (mockAdapter.getUserCounts as jest.Mock).mockResolvedValue(mockCounts);

      // Act
      const result = await service.getUserCounts();

      // Assert
      expect(result).toEqual({
        totalUsers: 100,
        activeUsers: 45,
      });

      expect(mockAdapter.getUserCounts).toHaveBeenCalled();
    });

    it("should handle zero counts", async () => {
      // Arrange
      const mockCounts = {
        totalUsers: 0,
        activeUsers: 0,
      };

      (mockAdapter.getUserCounts as jest.Mock).mockResolvedValue(mockCounts);

      // Act
      const result = await service.getUserCounts();

      // Assert
      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
      });
    });
  });
});

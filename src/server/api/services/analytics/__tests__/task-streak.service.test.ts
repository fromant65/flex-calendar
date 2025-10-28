/**
 * Task Streak Service Tests
 * 
 * Tests for the completion streak calculation logic
 */

import { TaskStreakService } from '../task-streak.service';
import type { TaskOccurrence } from '../../types';

// Mock the repository
jest.mock('../../../repository', () => ({
  TaskOccurrenceRepository: jest.fn().mockImplementation(() => ({
    findByTaskId: jest.fn(),
    findByOwnerIdWithTask: jest.fn(),
  })),
}));

describe('TaskStreakService', () => {
  let service: TaskStreakService;
  let mockRepo: {
    findByTaskId: jest.Mock;
    findByOwnerIdWithTask: jest.Mock;
  };

  beforeEach(() => {
    service = new TaskStreakService();
    mockRepo = (service as any).occurrenceRepo;
    jest.clearAllMocks();
  });

  describe('getTaskStreak', () => {
    it('should return zero streak for task with no occurrences', async () => {
      mockRepo.findByTaskId.mockResolvedValue([]);

      const result = await service.getTaskStreak(1);

      expect(result).toEqual({
        taskId: 1,
        currentStreak: 0,
        totalCompleted: 0,
        totalOccurrences: 0,
        completionRate: 0,
      });
    });

    it('should calculate streak for consecutive completed occurrences', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        {
          id: 1,
          associatedTaskId: 1,
          startDate: new Date('2025-10-25'),
          limitDate: new Date('2025-10-26'),
          status: 'Completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          associatedTaskId: 1,
          startDate: new Date('2025-10-24'),
          limitDate: new Date('2025-10-25'),
          status: 'Completed',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
        {
          id: 3,
          associatedTaskId: 1,
          startDate: new Date('2025-10-23'),
          limitDate: new Date('2025-10-24'),
          status: 'Completed',
          createdAt: new Date('2025-10-23'),
          updatedAt: null,
        },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      expect(result.currentStreak).toBe(3);
      expect(result.totalCompleted).toBe(3);
      expect(result.totalOccurrences).toBe(3);
      expect(result.completionRate).toBe(100);
    });

    it('should break streak on skipped occurrence', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        {
          id: 1,
          associatedTaskId: 1,
          startDate: new Date('2025-10-25'),
          limitDate: new Date('2025-10-26'),
          status: 'Completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          associatedTaskId: 1,
          startDate: new Date('2025-10-24'),
          limitDate: new Date('2025-10-25'),
          status: 'Skipped',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
        {
          id: 3,
          associatedTaskId: 1,
          startDate: new Date('2025-10-23'),
          limitDate: new Date('2025-10-24'),
          status: 'Completed',
          createdAt: new Date('2025-10-23'),
          updatedAt: null,
        },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // Streak should only count the most recent completed (breaks at skip)
      expect(result.currentStreak).toBe(1);
      expect(result.totalCompleted).toBe(2);
      expect(result.totalOccurrences).toBe(3);
    });

    it('should reset streak to 0 for expired occurrence', async () => {
      const now = new Date('2025-10-28');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const occurrences: Partial<TaskOccurrence>[] = [
        {
          id: 1,
          associatedTaskId: 1,
          startDate: new Date('2025-10-25'),
          limitDate: new Date('2025-10-26'),
          status: 'Completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          associatedTaskId: 1,
          startDate: new Date('2025-10-24'),
          limitDate: new Date('2025-10-27'), // Expired (limit date < now)
          status: 'Pending',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // Streak should be 0 because of expired occurrence
      expect(result.currentStreak).toBe(0);
      expect(result.totalCompleted).toBe(1);
      expect(result.totalOccurrences).toBe(2);

      jest.useRealTimers();
    });

    it('should not break streak for pending occurrences if not expired', async () => {
      const now = new Date('2025-10-28');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const occurrences: Partial<TaskOccurrence>[] = [
        {
          id: 1,
          associatedTaskId: 1,
          startDate: new Date('2025-10-27'),
          limitDate: new Date('2025-10-30'), // Not expired yet
          status: 'Pending',
          createdAt: new Date('2025-10-27'),
          updatedAt: null,
        },
        {
          id: 2,
          associatedTaskId: 1,
          startDate: new Date('2025-10-26'),
          limitDate: new Date('2025-10-27'),
          status: 'Completed',
          createdAt: new Date('2025-10-26'),
          updatedAt: null,
        },
        {
          id: 3,
          associatedTaskId: 1,
          startDate: new Date('2025-10-25'),
          limitDate: new Date('2025-10-26'),
          status: 'Completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // Streak should count both completed (pending doesn't break it)
      expect(result.currentStreak).toBe(2);
      expect(result.totalCompleted).toBe(2);
      expect(result.totalOccurrences).toBe(3);

      jest.useRealTimers();
    });

    it('should handle occurrences without limit date', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        {
          id: 1,
          associatedTaskId: 1,
          startDate: new Date('2025-10-25'),
          limitDate: null,
          status: 'Completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          associatedTaskId: 1,
          startDate: new Date('2025-10-24'),
          limitDate: null,
          status: 'Completed',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      expect(result.currentStreak).toBe(2);
      expect(result.totalCompleted).toBe(2);
      expect(result.totalOccurrences).toBe(2);
      expect(result.completionRate).toBe(100);
    });

    it('should calculate completion rate correctly', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        { id: 1, associatedTaskId: 1, startDate: new Date('2025-10-25'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        { id: 2, associatedTaskId: 1, startDate: new Date('2025-10-24'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        { id: 3, associatedTaskId: 1, startDate: new Date('2025-10-23'), status: 'Skipped', createdAt: new Date(), updatedAt: null },
        { id: 4, associatedTaskId: 1, startDate: new Date('2025-10-22'), status: 'Pending', createdAt: new Date(), updatedAt: null },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // 2 completed out of 4 total = 50%
      expect(result.completionRate).toBe(50);
    });

    it('should count only last streak, not maximum streak', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        { id: 1, associatedTaskId: 1, startDate: new Date('2025-10-27'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        { id: 2, associatedTaskId: 1, startDate: new Date('2025-10-26'), status: 'Skipped', createdAt: new Date(), updatedAt: null },
        { id: 3, associatedTaskId: 1, startDate: new Date('2025-10-25'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        { id: 4, associatedTaskId: 1, startDate: new Date('2025-10-24'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        { id: 5, associatedTaskId: 1, startDate: new Date('2025-10-23'), status: 'Completed', createdAt: new Date(), updatedAt: null },
      ];

      mockRepo.findByTaskId.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // Should be 1 (most recent), not 3 (maximum streak before skip)
      expect(result.currentStreak).toBe(1);
    });
  });

  describe('getTaskStreaks', () => {
    it('should get streaks for multiple tasks', async () => {
      mockRepo.findByTaskId
        .mockResolvedValueOnce([
          { id: 1, associatedTaskId: 1, startDate: new Date('2025-10-25'), status: 'Completed', createdAt: new Date(), updatedAt: null },
          { id: 2, associatedTaskId: 1, startDate: new Date('2025-10-24'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        ])
        .mockResolvedValueOnce([
          { id: 3, associatedTaskId: 2, startDate: new Date('2025-10-25'), status: 'Completed', createdAt: new Date(), updatedAt: null },
        ]);

      const result = await service.getTaskStreaks([1, 2]);

      expect(result.size).toBe(2);
      expect(result.get(1)?.currentStreak).toBe(2);
      expect(result.get(2)?.currentStreak).toBe(1);
    });
  });
});

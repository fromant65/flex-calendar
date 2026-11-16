/**
 * Task Streak Service Tests
 * 
 * Tests for the completion streak calculation logic
 */

import { TaskStreakService } from '../task-streak.service';
import type { TaskOccurrence } from '../../types';

// Mock the adapter
jest.mock('../../../adapter', () => ({
  OccurrenceAdapter: jest.fn().mockImplementation(() => ({
    getOccurrencesByTaskIdRaw: jest.fn(),
  })),
}));

// Mock the repositories that the adapter uses
jest.mock('../../../repository', () => ({
  TaskOccurrenceRepository: jest.fn().mockImplementation(() => ({})),
  CalendarEventRepository: jest.fn().mockImplementation(() => ({})),
  TaskRecurrenceRepository: jest.fn().mockImplementation(() => ({})),
}));

describe('TaskStreakService', () => {
  let service: TaskStreakService;
  let mockAdapter: {
    getOccurrencesByTaskIdRaw: jest.Mock;
  };

  beforeEach(() => {
    service = new TaskStreakService();
    mockAdapter = (service as any).occurrenceAdapter;
    jest.clearAllMocks();
  });

  describe('getTaskStreak', () => {
    it('should return zero streak for task with no occurrences', async () => {
      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue([]);

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
          taskId: 1,
          slotStartAt: new Date('2025-10-25'),
          dueAt: new Date('2025-10-26'),
          status: 'completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          taskId: 1,
          slotStartAt: new Date('2025-10-24'),
          dueAt: new Date('2025-10-25'),
          status: 'completed',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
        {
          id: 3,
          taskId: 1,
          slotStartAt: new Date('2025-10-23'),
          dueAt: new Date('2025-10-24'),
          status: 'completed',
          createdAt: new Date('2025-10-23'),
          updatedAt: null,
        },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

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
          taskId: 1,
          slotStartAt: new Date('2025-10-25'),
          dueAt: new Date('2025-10-26'),
          status: 'completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          taskId: 1,
          slotStartAt: new Date('2025-10-24'),
          dueAt: new Date('2025-10-25'),
          status: 'skipped',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
        {
          id: 3,
          taskId: 1,
          slotStartAt: new Date('2025-10-23'),
          dueAt: new Date('2025-10-24'),
          status: 'completed',
          createdAt: new Date('2025-10-23'),
          updatedAt: null,
        },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

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
          taskId: 1,
          slotStartAt: new Date('2025-10-25'),
          dueAt: new Date('2025-10-26'),
          status: 'completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          taskId: 1,
          slotStartAt: new Date('2025-10-24'),
          dueAt: new Date('2025-10-27'), // Expired (dueAt < now)
          status: 'pending',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

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
          taskId: 1,
          slotStartAt: new Date('2025-10-27'),
          dueAt: new Date('2025-10-30'), // Not expired yet
          status: 'pending',
          createdAt: new Date('2025-10-27'),
          updatedAt: null,
        },
        {
          id: 2,
          taskId: 1,
          slotStartAt: new Date('2025-10-26'),
          dueAt: new Date('2025-10-27'),
          status: 'completed',
          createdAt: new Date('2025-10-26'),
          updatedAt: null,
        },
        {
          id: 3,
          taskId: 1,
          slotStartAt: new Date('2025-10-25'),
          dueAt: new Date('2025-10-26'),
          status: 'completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

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
          taskId: 1,
          slotStartAt: new Date('2025-10-25'),
          dueAt: null,
          status: 'completed',
          createdAt: new Date('2025-10-25'),
          updatedAt: null,
        },
        {
          id: 2,
          taskId: 1,
          slotStartAt: new Date('2025-10-24'),
          dueAt: null,
          status: 'completed',
          createdAt: new Date('2025-10-24'),
          updatedAt: null,
        },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      expect(result.currentStreak).toBe(2);
      expect(result.totalCompleted).toBe(2);
      expect(result.totalOccurrences).toBe(2);
      expect(result.completionRate).toBe(100);
    });

    it('should calculate completion rate correctly', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        { id: 1, taskId: 1, slotStartAt: new Date('2025-10-25'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 2, taskId: 1, slotStartAt: new Date('2025-10-24'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 3, taskId: 1, slotStartAt: new Date('2025-10-23'), status: 'skipped', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 4, taskId: 1, slotStartAt: new Date('2025-10-22'), status: 'pending', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // 2 completed out of 4 total = 50%
      expect(result.completionRate).toBe(50);
    });

    it('should count only last streak, not maximum streak', async () => {
      const occurrences: Partial<TaskOccurrence>[] = [
        { id: 1, taskId: 1, slotStartAt: new Date('2025-10-27'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 2, taskId: 1, slotStartAt: new Date('2025-10-26'), status: 'skipped', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 3, taskId: 1, slotStartAt: new Date('2025-10-25'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 4, taskId: 1, slotStartAt: new Date('2025-10-24'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        { id: 5, taskId: 1, slotStartAt: new Date('2025-10-23'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
      ];

      mockAdapter.getOccurrencesByTaskIdRaw.mockResolvedValue(occurrences);

      const result = await service.getTaskStreak(1);

      // Should be 1 (most recent), not 3 (maximum streak before skip)
      expect(result.currentStreak).toBe(1);
    });
  });

  describe('getTaskStreaks', () => {
    it('should get streaks for multiple tasks', async () => {
      mockAdapter.getOccurrencesByTaskIdRaw
        .mockResolvedValueOnce([
          { id: 1, taskId: 1, slotStartAt: new Date('2025-10-25'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
          { id: 2, taskId: 1, slotStartAt: new Date('2025-10-24'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        ])
        .mockResolvedValueOnce([
          { id: 3, taskId: 2, slotStartAt: new Date('2025-10-25'), status: 'completed', createdAt: new Date(), updatedAt: null, dueAt: null, tentativeAt: null, slotEndAt: null, timeSpentMinutes: 0 },
        ]);

      const result = await service.getTaskStreaks([1, 2]);

      expect(result.size).toBe(2);
      expect(result.get(1)?.currentStreak).toBe(2);
      expect(result.get(2)?.currentStreak).toBe(1);
    });
  });
});

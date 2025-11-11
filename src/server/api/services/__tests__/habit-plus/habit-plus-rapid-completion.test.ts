/**
 * Tests for Habit+ Rapid Completion Edge Cases
 * Verifies that the system handles correctly when multiple occurrences are completed
 * in quick succession (e.g., all on the same day)
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit+ Rapid Completion Edge Cases', () => {
  let schedulerService: TaskSchedulerService;
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
    incrementCompletedOccurrences: jest.Mock;
  };
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    updateTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
    getOccurrencesByTaskId: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    mockRecurrenceAdapter = (schedulerService as unknown as { recurrenceAdapter: typeof mockRecurrenceAdapter }).recurrenceAdapter;
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    
    jest.clearAllMocks();
  });

  describe('Same-day completion scenarios', () => {
    it('should correctly schedule 4th occurrence when first 3 are completed on same day', async () => {
      // Scenario: User completes first 3 occurrences all on Monday
      // System should still schedule 4th occurrence for Saturday
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const completionDay = new Date('2024-10-21T10:00:00.000Z'); // Monday 10am
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 3, // Three completed
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      // Third occurrence was created for Friday but completed on Monday
      const thirdOccurrence: MockOccurrence = {
        id: 3,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-25T00:00:00.000Z'), // Friday (when it was supposed to be done)
        targetDate: new Date('2024-10-25T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
        completedAt: completionDay, // But completed on Monday
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(thirdOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 4, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Fourth occurrence should still be scheduled for Saturday (3 * 7/4 ≈ 5 days)
      const expectedStart = new Date('2024-10-26T00:00:00.000Z'); // Saturday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target and limit should be consistent with period
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      expect(capturedOccurrence.limitDate.getTime()).toBe(new Date('2024-10-28T00:00:00.000Z').getTime());
    });

    it('should correctly transition to next period when all occurrences completed early', async () => {
      // Scenario: User completes all 4 occurrences on Monday (first day of period)
      // Next occurrence should start on Monday of next week
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 4, // All completed
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      // Fourth occurrence scheduled for Saturday but completed on Monday
      const fourthOccurrence: MockOccurrence = {
        id: 4,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-26T00:00:00.000Z'), // Saturday (planned)
        targetDate: new Date('2024-10-26T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
        completedAt: new Date('2024-10-21T14:00:00.000Z'), // Monday 2pm
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(fourthOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(undefined);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 5, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Should transition to next period (Monday next week)
      const expectedStart = new Date('2024-10-28T00:00:00.000Z'); // Monday next week
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Verify period transition happened
      expect(mockRecurrenceAdapter.updateRecurrence).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          completedOccurrences: 0,
          lastPeriodStart: expectedStart,
        })
      );
    });

    it('should handle occurrences with startDate in the past correctly', async () => {
      // Scenario: User creates an occurrence on Monday with startDate Wednesday
      // Then completes it on Monday, and creates next one
      // This tests that we use startDate (not createdAt or completedAt) for calculations
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 1,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      // First occurrence created and completed on same day
      const firstOccurrence: MockOccurrence = {
        id: 1,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday (startDate)
        targetDate: new Date('2024-10-21T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
        completedAt: new Date('2024-10-21T09:00:00.000Z'), // Completed Monday 9am
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 2, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Second occurrence should be calculated from period start + (1 * 7/4)
      // regardless of when first was completed
      const expectedStart = new Date('2024-10-23T00:00:00.000Z'); // Wednesday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
    });
  });

  describe('Late completion scenarios', () => {
    it('should correctly schedule next occurrence when previous was completed late', async () => {
      // Scenario: First occurrence (Monday) completed on Friday
      // Second should still be scheduled for Wednesday based on period start
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 1,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      const firstOccurrence: MockOccurrence = {
        id: 1,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday (startDate)
        targetDate: new Date('2024-10-21T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
        completedAt: new Date('2024-10-25T15:00:00.000Z'), // Completed Friday 3pm (4 days late)
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 2, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Second occurrence should still be Wednesday (1 * 7/4 ≈ 2 days from period start)
      // NOT calculated from completion date
      const expectedStart = new Date('2024-10-23T00:00:00.000Z'); // Wednesday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
    });

    it('should handle completing occurrence after period ends', async () => {
      // Scenario: First occurrence completed after period limit
      // Should still count toward current period and schedule next in same period
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday Oct 21
      const interval = 7;
      const maxOccurrences = 3;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 1,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      const firstOccurrence: MockOccurrence = {
        id: 1,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday (period start)
        targetDate: new Date('2024-10-21T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'), // Period limit
        status: 'Completed',
        completedAt: new Date('2024-10-29T10:00:00.000Z'), // Completed 1 day after limit!
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 2, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Second occurrence should still be in the same period (1 * 7/3 ≈ 2 days from start)
      const expectedStart = new Date('2024-10-23T00:00:00.000Z'); // Wednesday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should still be the original period end
      const expectedLimit = new Date('2024-10-28T00:00:00.000Z');
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
    });
  });

  describe('Edge case: Overlapping occurrences', () => {
    it('should allow creating occurrence even if previous startDate is in the future', async () => {
      // Scenario: User completes second occurrence (Wed) before completing first (Mon)
      // Third should still be calculated correctly
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 2,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      // Latest occurrence is the second one (Wednesday)
      const secondOccurrence: MockOccurrence = {
        id: 2,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-23T00:00:00.000Z'), // Wednesday
        targetDate: new Date('2024-10-23T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
        completedAt: new Date('2024-10-21T12:00:00.000Z'), // Completed Monday noon
        task,
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(secondOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 3, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // Third occurrence: 2 * 7/4 = 3.5 ≈ 4 days from period start = Friday
      const expectedStart = new Date('2024-10-25T00:00:00.000Z'); // Friday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
    });
  });
});

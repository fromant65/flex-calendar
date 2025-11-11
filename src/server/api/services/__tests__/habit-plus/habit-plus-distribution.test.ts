/**
 * Tests for Habit+ Distribution Logic
 * Verifies that occurrences are distributed evenly throughout the period
 * following the rule: nth occurrence at periodStart + round(n * interval / maxOccurrences) days
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit+ Distribution Logic', () => {
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

  describe('4 occurrences in 7 days example', () => {
    it('should schedule first occurrence on Monday (period start) with target Monday and limit Sunday', async () => {
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      const interval = 7;
      const maxOccurrences = 4;

      const task: MockTask = {
        id: taskId,
        name: '4 occurrences per week',
        taskType: 'Hábito +',
        isActive: true,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 0,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 1, status: 'Pending' as const };
      });

      // Act
      await schedulerService.createNextOccurrence(taskId);

      // Assert
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      
      // First occurrence: startDate = Monday (period start)
      const expectedStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target should be the same as start date for Habit+
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should be at the end of the period (Sunday)
      const expectedLimit = new Date('2024-10-28T00:00:00.000Z'); // Sunday + 1 day = Monday next week
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
    });

    it('should schedule second occurrence ~Wednesday (7/4=1.75≈2 days from start)', async () => {
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
          completedOccurrences: 1, // First completed
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      const firstOccurrence: MockOccurrence = {
        id: 1,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday
        targetDate: new Date('2024-10-21T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
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
      
      // Second occurrence: 1 * 7/4 = 1.75 ≈ 2 days from Monday = Wednesday
      const expectedStart = new Date('2024-10-23T00:00:00.000Z'); // Wednesday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target should be the same as start date
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should still be at the end of the period
      const expectedLimit = new Date('2024-10-28T00:00:00.000Z');
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
    });

    it('should schedule third occurrence ~Friday (2*7/4=3.5≈4 days from start)', async () => {
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
          completedOccurrences: 2, // Two completed
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      const secondOccurrence: MockOccurrence = {
        id: 2,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-23T00:00:00.000Z'), // Wednesday
        targetDate: new Date('2024-10-23T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
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
      
      // Third occurrence: 2 * 7/4 = 3.5 ≈ 4 days from Monday = Friday
      const expectedStart = new Date('2024-10-25T00:00:00.000Z'); // Friday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target should be the same as start date
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should still be at the end of the period
      const expectedLimit = new Date('2024-10-28T00:00:00.000Z');
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
    });

    it('should schedule fourth occurrence ~Saturday (3*7/4=5.25≈5 days from start)', async () => {
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
          completedOccurrences: 3, // Three completed
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      const thirdOccurrence: MockOccurrence = {
        id: 3,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-25T00:00:00.000Z'), // Friday
        targetDate: new Date('2024-10-25T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
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
      
      // Fourth occurrence: 3 * 7/4 = 5.25 ≈ 5 days from Monday = Saturday
      const expectedStart = new Date('2024-10-26T00:00:00.000Z'); // Saturday
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target should be the same as start date
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should still be at the end of the period
      const expectedLimit = new Date('2024-10-28T00:00:00.000Z');
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
    });

    it('should transition to next period after completing all 4 occurrences', async () => {
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

      const fourthOccurrence: MockOccurrence = {
        id: 4,
        associatedTaskId: taskId,
        startDate: new Date('2024-10-26T00:00:00.000Z'), // Saturday
        targetDate: new Date('2024-10-26T00:00:00.000Z'),
        limitDate: new Date('2024-10-28T00:00:00.000Z'),
        status: 'Completed',
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
      
      // Fifth occurrence should start the next period: Monday of next week
      const expectedStart = new Date('2024-10-28T00:00:00.000Z'); // Monday next week
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedStart.getTime());
      
      // Target should be the same as start date
      expect(capturedOccurrence.targetDate.getTime()).toBe(expectedStart.getTime());
      
      // Limit should be at the end of the new period
      const expectedLimit = new Date('2024-11-04T00:00:00.000Z'); // Sunday of next week + 1
      expect(capturedOccurrence.limitDate.getTime()).toBe(expectedLimit.getTime());
      
      // Verify period was advanced and counter reset
      expect(mockRecurrenceAdapter.updateRecurrence).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          completedOccurrences: 0,
          lastPeriodStart: expectedStart,
        })
      );
    });
  });

  describe('Different distribution scenarios', () => {
    it('should handle 3 occurrences in 10 days correctly', async () => {
      const taskId = 1;
      const periodStart = new Date('2024-10-21T00:00:00.000Z');
      const interval = 10;
      const maxOccurrences = 3;

      const task: MockTask = {
        id: taskId,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: 0,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: 1, status: 'Pending' as const };
      });

      // Act - First occurrence
      await schedulerService.createNextOccurrence(taskId);

      // Assert - First at day 0
      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      expect(capturedOccurrence.startDate.getTime()).toBe(periodStart.getTime());

      // Simulate second occurrence
      task.recurrence.completedOccurrences = 1;
      const firstOcc: MockOccurrence = {
        id: 1,
        associatedTaskId: taskId,
        startDate: periodStart,
        targetDate: periodStart,
        limitDate: new Date('2024-10-31T00:00:00.000Z'),
        status: 'Completed',
        task,
      };
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOcc);
      
      await schedulerService.createNextOccurrence(taskId);
      
      // Second at 1 * 10/3 = 3.33 ≈ 3 days
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      const expectedSecond = new Date('2024-10-24T00:00:00.000Z');
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedSecond.getTime());

      // Simulate third occurrence
      task.recurrence.completedOccurrences = 2;
      const secondOcc: MockOccurrence = {
        id: 2,
        associatedTaskId: taskId,
        startDate: expectedSecond,
        targetDate: expectedSecond,
        limitDate: new Date('2024-10-31T00:00:00.000Z'),
        status: 'Completed',
        task,
      };
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(secondOcc);
      
      await schedulerService.createNextOccurrence(taskId);
      
      // Third at 2 * 10/3 = 6.67 ≈ 7 days
      if (!capturedOccurrence) throw new Error('Occurrence was not created');
      const expectedThird = new Date('2024-10-28T00:00:00.000Z');
      expect(capturedOccurrence.startDate.getTime()).toBe(expectedThird.getTime());
    });
  });
});

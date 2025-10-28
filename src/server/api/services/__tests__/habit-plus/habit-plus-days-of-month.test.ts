/**
 * Tests for Habit+ with daysOfMonth Recurrence
 * Verifies scheduling behavior when using specific days of the month
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit+ with daysOfMonth Recurrence', () => {
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    updateTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
    getOccurrencesByTaskId: jest.Mock;
  };
  let mockRecurrenceRepo: {
    findById: jest.Mock;
    updateById: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    jest.clearAllMocks();
  });

  it('should schedule next occurrence on the next specified day of month', async () => {
    // Setup: Habit+ that occurs on the 1st, 10th, and 20th of each month
    const taskId = 1;
    const periodStart = new Date('2024-10-01T00:00:00.000Z'); // October 1st

    const task: MockTask = {
      id: taskId,
      name: 'Monthly Review',
      taskType: 'Hábito +',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: [1, 10, 20],
        maxOccurrences: 3,
        completedOccurrences: 1, // Completed 1st
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    // Latest occurrence was on the 1st
    const firstOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-01T00:00:00.000Z'),
      targetDate: new Date('2024-10-01T12:00:00.000Z'),
      limitDate: new Date('2024-10-01T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Next occurrence should be on the 10th
    const expectedDate = new Date('2024-10-10T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should advance to next month after completing all days in current month', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-01T00:00:00.000Z'); // October 1st

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: [1, 10, 20],
        maxOccurrences: 3,
        completedOccurrences: 3, // All 3 completed this month
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    // Latest occurrence was on the 20th
    const lastOccurrence: MockOccurrence = {
      id: 3,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-20T00:00:00.000Z'),
      targetDate: new Date('2024-10-20T12:00:00.000Z'),
      limitDate: new Date('2024-10-20T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(lastOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 4, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Should schedule for the 1st of November
    const expectedDate = new Date('2024-11-01T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
    
    // Verify counter was reset and period advanced
    expect(mockRecurrenceRepo.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedOccurrences: 0,
        lastPeriodStart: expectedDate, // New month starts on the 1st
      })
    );
  });

  it('should handle end-of-month days correctly (28, 29, 30, 31)', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-01-28T00:00:00.000Z'); // January 28th

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: [28, 30, 31],
        maxOccurrences: 3,
        completedOccurrences: 1, // Completed 28th
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    const firstOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-01-28T00:00:00.000Z'),
      targetDate: new Date('2024-01-28T12:00:00.000Z'),
      limitDate: new Date('2024-01-28T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Should schedule for the 30th
    const expectedDate = new Date('2024-01-30T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should skip invalid days in February (day 30 doesn\'t exist)', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-02-01T00:00:00.000Z'); // February 1st (2024 is leap year)

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: [15, 30], // 30 doesn't exist in February (only has 29 days in 2024)
        maxOccurrences: 2,
        completedOccurrences: 1, // Completed 15th
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    const firstOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-02-15T00:00:00.000Z'),
      targetDate: new Date('2024-02-15T12:00:00.000Z'),
      limitDate: new Date('2024-02-15T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Since Feb 2024 doesn't have day 30 (only 29), it should skip to next month
    // The next occurrence should be March 15th (first available day in daysOfMonth)
    const expectedDate = new Date('2024-03-15T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should handle single day per month pattern', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-01T00:00:00.000Z'); // October 1st

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: [1], // Only the 1st of each month
        maxOccurrences: 1,
        completedOccurrences: 1, // Completed this month
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    const firstOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-01T00:00:00.000Z'),
      targetDate: new Date('2024-10-01T12:00:00.000Z'),
      limitDate: new Date('2024-10-01T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(firstOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Should schedule for November 1st
    const expectedDate = new Date('2024-11-01T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });
});

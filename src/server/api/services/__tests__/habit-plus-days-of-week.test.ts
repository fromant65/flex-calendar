/**
 * Tests for Habit+ with daysOfWeek Recurrence
 * Verifies scheduling behavior when using specific days of the week
 */

import './mocks';
import { TaskSchedulerService } from '../task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from './test-types';

describe('Habit+ with daysOfWeek Recurrence', () => {
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

  it('should schedule next occurrence on the next specified day of week', async () => {
    // Setup: Habit+ that occurs on Mon, Wed, Fri (3 times per week)
    const taskId = 1;
    const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday, Oct 21

    const task: MockTask = {
      id: taskId,
      name: 'Workout',
      taskType: 'Hábito +',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        maxOccurrences: 3,
        completedOccurrences: 1, // Completed Monday
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    // Latest occurrence was on Monday
    const mondayOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday
      targetDate: new Date('2024-10-21T12:00:00.000Z'),
      limitDate: new Date('2024-10-21T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(mondayOccurrence);
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
    
    // Next occurrence should be on Wednesday (Oct 23)
    const expectedDate = new Date('2024-10-23T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should skip to next week after completing all days in current week', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday, Oct 21 (start of week)

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        maxOccurrences: 3,
        completedOccurrences: 3, // All 3 completed this week
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    // Latest occurrence was Friday
    const fridayOccurrence: MockOccurrence = {
      id: 3,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-25T00:00:00.000Z'), // Friday, Oct 25
      targetDate: new Date('2024-10-25T12:00:00.000Z'),
      limitDate: new Date('2024-10-25T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(fridayOccurrence);
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
    
    // Should schedule for Monday of next week (Oct 28)
    const expectedDate = new Date('2024-10-28T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
    
    // Verify counter was reset and period advanced
    expect(mockRecurrenceRepo.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedOccurrences: 0,
        lastPeriodStart: expectedDate, // New week starts Monday
      })
    );
  });

  it('should handle Tuesday, Thursday pattern correctly', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-22T00:00:00.000Z'); // Tuesday, Oct 22

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: ['Tue', 'Thu'],
        daysOfMonth: null,
        maxOccurrences: 2,
        completedOccurrences: 1, // Completed Tuesday
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    const tuesdayOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-22T00:00:00.000Z'), // Tuesday
      targetDate: new Date('2024-10-22T12:00:00.000Z'),
      limitDate: new Date('2024-10-22T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(tuesdayOccurrence);
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
    
    // Should schedule for Thursday (Oct 24)
    const expectedDate = new Date('2024-10-24T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should handle weekend pattern (Sat, Sun)', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-26T00:00:00.000Z'); // Saturday, Oct 26

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval: null,
        daysOfWeek: ['Sat', 'Sun'],
        daysOfMonth: null,
        maxOccurrences: 2,
        completedOccurrences: 1, // Completed Saturday
        lastPeriodStart: periodStart,
        endDate: null,
      },
    };

    const saturdayOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-26T00:00:00.000Z'), // Saturday
      targetDate: new Date('2024-10-26T12:00:00.000Z'),
      limitDate: new Date('2024-10-26T23:59:59.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(saturdayOccurrence);
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
    
    // Should schedule for Sunday (Oct 27)
    const expectedDate = new Date('2024-10-27T00:00:00.000Z');
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedDate.toISOString());
  });
});

/**
 * Tests for Habit+ First Occurrence Completion
 * Verifies that the second occurrence is scheduled in the same period after completing the first
 */

import './mocks';
import { TaskSchedulerService } from '../task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from './test-types';

describe('Habit+ First Occurrence Completion', () => {
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
    
    // Access mocked instances
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    jest.clearAllMocks();
  });

  it('should schedule second occurrence in the same period after completing first', async () => {
    // Setup: Habit+ with 3 occurrences per week (7 days)
    const taskId = 1;
    const periodStart = new Date('2024-10-21T00:00:00.000Z'); // Monday
    const interval = 7;
    const maxOccurrences = 3;

    const task: MockTask = {
      id: taskId,
      name: 'Test Habit+',
      taskType: 'Hábito +',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences,
        completedOccurrences: 1, // First one completed
        lastPeriodStart: periodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const firstOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: periodStart,
      targetDate: new Date('2024-10-25T00:00:00.000Z'),
      limitDate: new Date('2024-10-28T00:00:00.000Z'),
      status: 'Completed',
      task,
    };

    // Mock responses
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
    
    // Calculate period end
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + interval);
    
    // The next occurrence should be within the same period
    expect(capturedOccurrence.startDate.getTime()).toBeGreaterThan(firstOccurrence.startDate.getTime());
    expect(capturedOccurrence.startDate.getTime()).toBeLessThan(periodEnd.getTime());
  });

  it('should schedule in same period even if first was completed late', async () => {
    const taskId = 1;
    const periodStart = new Date('2024-10-21T00:00:00.000Z');
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
      startDate: periodStart,
      targetDate: new Date('2024-10-23T00:00:00.000Z'),
      limitDate: new Date('2024-10-25T00:00:00.000Z'),
      status: 'Completed',
      completedAt: new Date('2024-10-26T00:00:00.000Z'), // Completed late
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
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + interval);
    expect(capturedOccurrence.startDate.getTime()).toBeLessThan(periodEnd.getTime());
  });
});

/**
 * Tests for Habit First Occurrence Creation
 * Verifies that the first occurrence starts at the period start date, not interval days later
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, CreateOccurrenceDTO } from '../test-types';

describe('Habit First Occurrence Creation', () => {
  let schedulerService: TaskSchedulerService;
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
  };
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    mockRecurrenceAdapter = (schedulerService as unknown as { recurrenceAdapter: typeof mockRecurrenceAdapter }).recurrenceAdapter;
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    
    jest.clearAllMocks();
  });

  it('should create first occurrence starting at period start, not interval days later', async () => {
    // Arrange: Habit with 6-day interval created on Nov 13
    const taskId = 1;
    const interval = 6;
    const periodStart = new Date('2024-11-13T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Test Habit',
      taskType: 'Hábito',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: null, // Infinite habit
        completedOccurrences: 0, // No occurrences completed yet
        lastPeriodStart: periodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null); // No previous occurrence
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 1, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }

    // The first occurrence should start at the period start (Nov 13), NOT interval days later (Nov 19)
    expect(capturedOccurrence.startDate.toISOString()).toBe(periodStart.toISOString());
    
    // Target should be 60% of interval = floor(6 * 0.6) = 3 days later (Nov 16)
    const expectedTarget = new Date(periodStart);
    expectedTarget.setDate(expectedTarget.getDate() + Math.floor(interval * 0.6));
    expect(capturedOccurrence.targetDate.toISOString()).toBe(expectedTarget.toISOString());
    
    // Limit should be interval days later (Nov 19)
    const expectedLimit = new Date(periodStart);
    expectedLimit.setDate(expectedLimit.getDate() + interval);
    expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
  });

  it('should create second occurrence interval days after first was created', async () => {
    // Arrange: Habit where first occurrence was already created
    const taskId = 1;
    const interval = 6;
    const periodStart = new Date('2024-11-13T00:00:00.000Z');
    const firstOccurrenceStart = new Date('2024-11-13T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Test Habit',
      taskType: 'Hábito',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: null,
        completedOccurrences: 0,
        lastPeriodStart: periodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const firstOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: firstOccurrenceStart,
      targetDate: new Date('2024-11-16T00:00:00.000Z'),
      limitDate: new Date('2024-11-19T00:00:00.000Z'),
      status: 'Completed' as const,
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
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }

    // The second occurrence should start interval days after the first (Nov 19)
    const expectedSecondStart = new Date(firstOccurrenceStart);
    expectedSecondStart.setDate(expectedSecondStart.getDate() + interval);
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedSecondStart.toISOString());
    
    // Target should be 3 days later (Nov 22)
    const expectedTarget = new Date(expectedSecondStart);
    expectedTarget.setDate(expectedTarget.getDate() + Math.floor(interval * 0.6));
    expect(capturedOccurrence.targetDate.toISOString()).toBe(expectedTarget.toISOString());
    
    // Limit should be interval days later (Nov 25)
    const expectedLimit = new Date(expectedSecondStart);
    expectedLimit.setDate(expectedLimit.getDate() + interval);
    expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
  });

  it('should handle different interval values correctly', async () => {
    const testCases = [
      { interval: 1, name: 'Daily habit' },
      { interval: 3, name: '3-day habit' },
      { interval: 7, name: 'Weekly habit' },
      { interval: 14, name: 'Bi-weekly habit' },
    ];

    for (const testCase of testCases) {
      jest.clearAllMocks();
      
      const taskId = 1;
      const periodStart = new Date('2024-11-13T00:00:00.000Z');

      const task: MockTask = {
        id: taskId,
        name: testCase.name,
        taskType: 'Hábito',
        isActive: true,
        recurrence: {
          id: 1,
          interval: testCase.interval,
          maxOccurrences: null,
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

      await schedulerService.createNextOccurrence(taskId);

      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) continue;

      // First occurrence should always start at period start
      expect(capturedOccurrence.startDate.toISOString()).toBe(periodStart.toISOString());
      
      // Verify dates are calculated correctly based on interval
      const expectedTarget = new Date(periodStart);
      expectedTarget.setDate(expectedTarget.getDate() + Math.floor(testCase.interval * 0.6));
      expect(capturedOccurrence.targetDate.toISOString()).toBe(expectedTarget.toISOString());
      
      const expectedLimit = new Date(periodStart);
      expectedLimit.setDate(expectedLimit.getDate() + testCase.interval);
      expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
    }
  });
});

/**
 * Tests for Habit+ First Occurrence Creation
 * Verifies that the first occurrence of a Habit+ starts at the period start date
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, CreateOccurrenceDTO } from '../test-types';

describe('Habit+ First Occurrence Creation', () => {
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

  it('should create first occurrence of Habit+ at period start (occurrence 0)', async () => {
    // Arrange: Habit+ with 3 occurrences per 6-day period, created on Nov 13
    const taskId = 1;
    const interval = 6;
    const maxOccurrences = 3;
    const periodStart = new Date('2024-11-13T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Test Habit+',
      taskType: 'Hábito +',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences,
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

    // Formula: startDate = periodStart + round((completedOccurrences * interval) / maxOccurrences)
    // For first occurrence (completedOccurrences = 0): startDate = periodStart + round(0) = periodStart
    const expectedStart = periodStart;
    expect(capturedOccurrence.startDate.toISOString()).toBe(expectedStart.toISOString());
    
    // For Habit+, targetDate should be the startDate itself
    expect(capturedOccurrence.targetDate.toISOString()).toBe(expectedStart.toISOString());
    
    // Limit should be the end of the period (periodStart + interval)
    const expectedLimit = new Date(periodStart);
    expectedLimit.setDate(expectedLimit.getDate() + interval);
    expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
  });

  it('should distribute occurrences evenly across the period', async () => {
    // Test that occurrences 0, 1, 2 are distributed correctly
    const taskId = 1;
    const interval = 6;
    const maxOccurrences = 3;
    const periodStart = new Date('2024-11-13T00:00:00.000Z');

    // Test each occurrence position
    for (let completedCount = 0; completedCount < maxOccurrences; completedCount++) {
      jest.clearAllMocks();

      const task: MockTask = {
        id: taskId,
        name: 'Test Habit+',
        taskType: 'Hábito +',
        isActive: true,
        recurrence: {
          id: 1,
          interval,
          maxOccurrences,
          completedOccurrences: completedCount,
          lastPeriodStart: periodStart,
          daysOfWeek: null,
          daysOfMonth: null,
          endDate: null,
        },
      };

      // Mock previous occurrence if not first
      const previousOccurrence = completedCount > 0 ? {
        id: completedCount,
        associatedTaskId: taskId,
        startDate: new Date(periodStart.getTime() + Math.round(((completedCount - 1) * interval) / maxOccurrences) * 24 * 60 * 60 * 1000),
        targetDate: periodStart,
        limitDate: new Date(periodStart.getTime() + interval * 24 * 60 * 60 * 1000),
        status: 'Completed' as const,
        task,
      } : null;

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
      mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(previousOccurrence);
      mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
      
      let capturedOccurrence: CreateOccurrenceDTO | undefined;
      mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
        capturedOccurrence = data;
        return { ...data, id: completedCount + 1, status: 'Pending' as const };
      });

      await schedulerService.createNextOccurrence(taskId);

      expect(capturedOccurrence).toBeDefined();
      if (!capturedOccurrence) continue;

      // Calculate expected start date using the formula
      const daysFromStart = Math.round((completedCount * interval) / maxOccurrences);
      const expectedStart = new Date(periodStart);
      expectedStart.setDate(expectedStart.getDate() + daysFromStart);

      expect(capturedOccurrence.startDate.toISOString()).toBe(expectedStart.toISOString());

      // For Habit+, all occurrences in the period should have the same limit (end of period)
      const expectedLimit = new Date(periodStart);
      expectedLimit.setDate(expectedLimit.getDate() + interval);
      expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
    }
  });

  it('should handle different interval and maxOccurrences combinations', async () => {
    const testCases = [
      { interval: 7, maxOccurrences: 2, name: '2 times per week' },
      { interval: 7, maxOccurrences: 3, name: '3 times per week' },
      { interval: 14, maxOccurrences: 4, name: '4 times per 2 weeks' },
      { interval: 30, maxOccurrences: 5, name: '5 times per month' },
    ];

    for (const testCase of testCases) {
      jest.clearAllMocks();
      
      const taskId = 1;
      const periodStart = new Date('2024-11-13T00:00:00.000Z');

      const task: MockTask = {
        id: taskId,
        name: testCase.name,
        taskType: 'Hábito +',
        isActive: true,
        recurrence: {
          id: 1,
          interval: testCase.interval,
          maxOccurrences: testCase.maxOccurrences,
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
      
      // Verify limit is at period end
      const expectedLimit = new Date(periodStart);
      expectedLimit.setDate(expectedLimit.getDate() + testCase.interval);
      expect(capturedOccurrence.limitDate.toISOString()).toBe(expectedLimit.toISOString());
    }
  });
});

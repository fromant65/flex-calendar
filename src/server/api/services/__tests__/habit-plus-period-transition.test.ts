/**
 * Tests for Habit+ Period Transition
 * Verifies that after completing all occurrences in a period, the next one starts in the new period
 */

import './mocks';
import { TaskSchedulerService } from '../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from './test-types';

describe('Habit+ Period Transition', () => {
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

  it('should move to next period after completing all 3 occurrences', async () => {
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
        completedOccurrences: 3, // All completed
        lastPeriodStart: periodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const thirdOccurrence: MockOccurrence = {
      id: 3,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-25T00:00:00.000Z'),
      targetDate: new Date('2024-10-27T00:00:00.000Z'),
      limitDate: new Date('2024-10-28T00:00:00.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(thirdOccurrence);
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
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Period end should be 7 days after start
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + interval);
    
    // Next occurrence should be in the new period (after period end)
    expect(capturedOccurrence.startDate.getTime()).toBeGreaterThanOrEqual(periodEnd.getTime());
    
    // Verify the period was advanced
    expect(mockRecurrenceRepo.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedOccurrences: 0, // Reset counter
        lastPeriodStart: periodEnd, // New period start
      })
    );
  });

  it('should handle multiple periods correctly', async () => {
    const taskId = 1;
    const firstPeriodStart = new Date('2024-10-21T00:00:00.000Z');
    const interval = 7;
    const maxOccurrences = 2;

    // Simulate we're already in the second period
    const secondPeriodStart = new Date(firstPeriodStart);
    secondPeriodStart.setDate(secondPeriodStart.getDate() + interval);

    const task: MockTask = {
      id: taskId,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences,
        completedOccurrences: 2, // All completed in second period
        lastPeriodStart: secondPeriodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const lastOccurrence: MockOccurrence = {
      id: 4,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-30T00:00:00.000Z'), // In second period
      targetDate: new Date('2024-11-01T00:00:00.000Z'),
      limitDate: new Date('2024-11-04T00:00:00.000Z'),
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
      return { ...data, id: 5, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert
    const secondPeriodEnd = new Date(secondPeriodStart);
    secondPeriodEnd.setDate(secondPeriodEnd.getDate() + interval);
    
    expect(capturedOccurrence).toBeDefined();
    if (!capturedOccurrence) {
      throw new Error('Occurrence was not created');
    }
    
    // Should move to third period
    expect(capturedOccurrence.startDate.getTime()).toBeGreaterThanOrEqual(secondPeriodEnd.getTime());
  });
});

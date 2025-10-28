/**
 * Tests for Habit+ Second Occurrence Completion
 * Verifies that the third occurrence is scheduled in the same period
 */

import './mocks';
import { TaskSchedulerService } from '../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from './test-types';

describe('Habit+ Second Occurrence Completion', () => {
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

  it('should schedule third occurrence in same period after completing second', async () => {
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
      startDate: new Date('2024-10-23T00:00:00.000Z'),
      targetDate: new Date('2024-10-25T00:00:00.000Z'),
      limitDate: new Date('2024-10-27T00:00:00.000Z'),
      status: 'Completed',
      task,
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(secondOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 3, status: 'Pending' as const };
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
    
    expect(capturedOccurrence.startDate.getTime()).toBeGreaterThan(secondOccurrence.startDate.getTime());
    expect(capturedOccurrence.startDate.getTime()).toBeLessThan(periodEnd.getTime());
  });
});

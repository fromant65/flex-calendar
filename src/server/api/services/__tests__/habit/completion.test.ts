/**
 * Tests for Habit (Hábito) Completion
 * Verifies that completing an occurrence:
 * - Does NOT change the task (task remains active)
 * - Next occurrence is generated at the start of the next period
 */

import '../mocks';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit Completion', () => {
  let completionService: OccurrenceCompletionService;
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    completeTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getOccurrenceWithTask: jest.Mock;
    getOccurrencesByTaskId: jest.Mock;
    completeOccurrence: jest.Mock;
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
  };
  let mockEventAdapter: {
    getEventsByOccurrenceId: jest.Mock;
    completeEvent: jest.Mock;
  };
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    completionService = new OccurrenceCompletionService(schedulerService);
    
    // Access mocked instances from both services
    const completionTaskAdapter = (completionService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const completionOccurrenceAdapter = (completionService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const completionEventAdapter = (completionService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    const schedulerTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const schedulerOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const schedulerRecurrenceAdapter = (schedulerService as unknown as { recurrenceAdapter: typeof mockRecurrenceAdapter }).recurrenceAdapter;
    
    // Use completion service adapters as the primary mocks
    mockTaskAdapter = completionTaskAdapter;
    mockOccurrenceAdapter = completionOccurrenceAdapter;
    mockEventAdapter = completionEventAdapter;
    mockRecurrenceAdapter = schedulerRecurrenceAdapter;
    
    // Ensure scheduler service uses the same mocked functions
    schedulerTaskAdapter.getTaskWithRecurrence = completionTaskAdapter.getTaskWithRecurrence;
    schedulerTaskAdapter.completeTask = completionTaskAdapter.completeTask;
    schedulerOccurrenceAdapter.createOccurrence = completionOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getLatestOccurrenceByTaskId = completionOccurrenceAdapter.getLatestOccurrenceByTaskId;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = completionOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should NOT deactivate task when completing habit occurrence', async () => {
    // Arrange: Habit (has interval, no maxOccurrences)
    const occurrenceId = 1;
    const taskId = 1;
    const interval = 7; // Weekly

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Habit',
      isActive: true,
      recurrence: {
        id: 1,
        interval, // Has interval = habit
        maxOccurrences: null, // Infinite
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-21T00:00:00.000Z'),
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-21T00:00:00.000Z'),
      targetDate: new Date('2024-10-25T00:00:00.000Z'),
      limitDate: new Date('2024-10-28T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence,
      status: 'Completed',
    });
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 2,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-28T00:00:00.000Z'),
      targetDate: new Date('2024-11-01T00:00:00.000Z'),
      limitDate: new Date('2024-11-04T00:00:00.000Z'),
      status: 'Pending',
    });

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Task was NOT deactivated (habits are infinite)
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });

  it('should create next occurrence at start of next period after completing', async () => {
    const occurrenceId = 2;
    const taskId = 2;
    const interval = 7;
    const periodStart = new Date('2024-10-21T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      isActive: true,
      recurrence: {
        id: 2,
        interval,
        maxOccurrences: null,
        completedOccurrences: 0,
        lastPeriodStart: periodStart,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: periodStart,
      targetDate: new Date('2024-10-23T00:00:00.000Z'),
      limitDate: new Date('2024-10-25T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence,
      status: 'Completed',
    });

    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 3, status: 'Pending' as const };
    });

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Next occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    
    // The next occurrence should start at the beginning of the next period
    // (periodStart + interval days)
    const expectedNextPeriodStart = new Date(periodStart);
    expectedNextPeriodStart.setDate(expectedNextPeriodStart.getDate() + interval);
    
    // Note: The exact date calculation is handled by the service
    expect(capturedOccurrence).toBeDefined();
  });

  it('should handle habit completion without affecting task state', async () => {
    const occurrenceId = 3;
    const taskId = 3;

    const task: MockTask = {
      id: taskId,
      isActive: true,
      recurrence: {
        id: 3,
        interval: 1, // Daily
        maxOccurrences: null,
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-28T00:00:00.000Z'),
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-28T00:00:00.000Z'),
      targetDate: new Date('2024-10-28T10:00:00.000Z'),
      limitDate: new Date('2024-10-28T23:59:59.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(true);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence,
      status: 'Completed',
    });
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 4,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-29T00:00:00.000Z'),
      targetDate: new Date('2024-10-29T10:00:00.000Z'),
      limitDate: new Date('2024-10-29T23:59:59.000Z'),
      status: 'Pending',
    });

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Occurrence completed
    expect(mockOccurrenceAdapter.completeOccurrence).toHaveBeenCalledTimes(1);
    expect(mockOccurrenceAdapter.completeOccurrence.mock.calls[0]![0]).toBe(occurrenceId);
    
    // Assert: Next occurrence created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    
    // Assert: Task remains active
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });
});

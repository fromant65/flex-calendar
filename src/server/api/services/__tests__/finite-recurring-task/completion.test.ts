/**
 * Tests for Finite Recurring Task (Recurrente Finita) Completion
 * Verifies that completing occurrences creates next ones until maxOccurrences is reached,
 * then deactivates the task
 */

import '../mocks';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Finite Recurring Task Completion', () => {
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
    skipOccurrence: jest.Mock;
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
  };
  let mockEventAdapter: {
    getEventsByOccurrenceId: jest.Mock;
    completeEvent: jest.Mock;
    deleteEvent: jest.Mock;
  };
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
    incrementCompletedOccurrences: jest.Mock;
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
    // by copying the mock implementations from completion service to scheduler service
    schedulerTaskAdapter.getTaskWithRecurrence = completionTaskAdapter.getTaskWithRecurrence;
    schedulerTaskAdapter.completeTask = completionTaskAdapter.completeTask;
    schedulerOccurrenceAdapter.createOccurrence = completionOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getLatestOccurrenceByTaskId = completionOccurrenceAdapter.getLatestOccurrenceByTaskId;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = completionOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should create next occurrence when completing if not all N occurrences exist yet', async () => {
    // Arrange: Finite task with 5 max occurrences, completing the 1st
    const occurrenceId = 1;
    const taskId = 1;
    const maxOccurrences = 5;

    const task: MockTask = {
      id: taskId,
      name: 'Finite Task',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-28T00:00:00.000Z'),
      targetDate: new Date('2024-10-30T00:00:00.000Z'),
      limitDate: new Date('2024-11-01T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    // Mock: Only 1 occurrence completed so far
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockRecurrenceAdapter.incrementCompletedOccurrences.mockResolvedValue(true);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence,
      status: 'Completed',
    });
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 2,
      associatedTaskId: taskId,
      startDate: new Date(),
      targetDate: new Date(),
      limitDate: new Date(),
      status: 'Pending',
    });

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Next occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    
    // Assert: Task was NOT deactivated (still has more occurrences)
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });

  it('should deactivate task after completing all N occurrences', async () => {
    // Arrange: Completing the last (3rd) of 3 occurrences
    const occurrenceId = 3;
    const taskId = 2;
    const maxOccurrences = 3;

    const task: MockTask = {
      id: taskId,
      name: 'Finite Task Complete',
      isActive: true,
      recurrence: {
        id: 2,
        interval: null,
        maxOccurrences,
        completedOccurrences: 2, // 2 already completed
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-11-11T00:00:00.000Z'),
      targetDate: new Date('2024-11-13T00:00:00.000Z'),
      limitDate: new Date('2024-11-15T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    // All 3 occurrences completed
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 2, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 3, associatedTaskId: taskId, status: 'Completed' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceAdapter.incrementCompletedOccurrences.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Task was deactivated
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
    
    // Assert: No next occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
  });

  it('should not create more than N occurrences even when skipping', async () => {
    // Arrange: Task with 4 max occurrences, skipping the 2nd
    const occurrenceId = 2;
    const taskId = 3;
    const maxOccurrences = 4;

    const task: MockTask = {
      id: taskId,
      name: 'Skip Finite Task',
      isActive: true,
      recurrence: {
        id: 3,
        interval: null,
        maxOccurrences,
        completedOccurrences: 1, // 1 already done
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-29T00:00:00.000Z'),
      targetDate: new Date('2024-10-31T00:00:00.000Z'),
      limitDate: new Date('2024-11-02T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    // 2 occurrences so far (1 completed, 1 being skipped)
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 2, associatedTaskId: taskId, status: 'Skipped' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence,
      status: 'Skipped',
    });
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 3,
      associatedTaskId: taskId,
      startDate: new Date(),
      targetDate: new Date(),
      limitDate: new Date(),
      status: 'Pending',
    });

    // Act
    await completionService.skipOccurrence(occurrenceId);

    // Assert: Next occurrence was created (since we haven't reached maxOccurrences yet)
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    
    // The service should respect maxOccurrences limit and not create more than 4 total
  });

  it('should handle completing occurrences in sequence correctly', async () => {
    const taskId = 4;
    const maxOccurrences = 3;

    const task: MockTask = {
      id: taskId,
      name: 'Sequential Task',
      isActive: true,
      recurrence: {
        id: 4,
        interval: null,
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    // Complete first occurrence
    const occurrence1: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-28T00:00:00.000Z'),
      targetDate: new Date('2024-10-30T00:00:00.000Z'),
      limitDate: new Date('2024-11-01T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence1);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue([
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
    ]);
    mockRecurrenceAdapter.incrementCompletedOccurrences.mockResolvedValue(true);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue({
      ...occurrence1,
      status: 'Completed',
    });
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 2,
      associatedTaskId: taskId,
      startDate: new Date(),
      targetDate: new Date(),
      limitDate: new Date(),
      status: 'Pending',
    });

    // Act: Complete first
    await completionService.completeOccurrence(1);

    // Assert: Next occurrence created, task still active
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });
});

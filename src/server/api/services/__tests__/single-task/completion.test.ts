/**
 * Tests for Single Task (Tarea Única) Completion
 * Verifies that completing (or skipping) the occurrence deactivates the task (isActive=false)
 */

import '../mocks';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence } from '../test-types';

describe('Single Task Completion', () => {
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
  };
  let mockEventAdapter: {
    getEventsByOccurrenceId: jest.Mock;
    completeEvent: jest.Mock;
    deleteEvent: jest.Mock;
  };
  let mockRecurrenceRepo: {
    updateById: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    completionService = new OccurrenceCompletionService(schedulerService);
    
    // Access mocked instances from completion service
    mockTaskAdapter = (completionService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (completionService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockEventAdapter = (completionService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    // Access recurrence repo from scheduler service
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    // IMPORTANT: Both services share the same mocked adapter instances
    // So mockTaskAdapter.getTaskWithRecurrence applies to both completion and scheduler services
    
    jest.clearAllMocks();
  });

  it('should deactivate task when completing the only occurrence', async () => {
    // Arrange: Single task with one occurrence
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Single Task',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        maxOccurrences: 1, // Single task
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
      targetDate: new Date('2024-10-30T10:00:00.000Z'),
      limitDate: new Date('2024-11-05T23:59:59.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Occurrence was completed
    expect(mockOccurrenceAdapter.completeOccurrence).toHaveBeenCalledWith(occurrenceId);
    
    // Assert: Task was deactivated (isActive = false)
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });

  it('should deactivate task when skipping the only occurrence', async () => {
    // Arrange: Single task with one occurrence to skip
    const occurrenceId = 2;
    const taskId = 2;

    const task: MockTask = {
      id: taskId,
      name: 'Single Task to Skip',
      isActive: true,
      recurrence: {
        id: 2,
        interval: null,
        maxOccurrences: 1,
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
      targetDate: new Date('2024-10-30T10:00:00.000Z'),
      limitDate: new Date('2024-11-05T23:59:59.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    // Mock for BOTH completion service AND scheduler service
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockEventAdapter.deleteEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);

    // Act
    await completionService.skipOccurrence(occurrenceId);

    // Assert: Occurrence was skipped
    expect(mockOccurrenceAdapter.skipOccurrence).toHaveBeenCalledWith(occurrenceId);
    
    // Assert: Task was deactivated
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });

  it('should not create next occurrence for single task', async () => {
    const occurrenceId = 3;
    const taskId = 3;

    const task: MockTask = {
      id: taskId,
      isActive: true,
      recurrence: {
        id: 3,
        interval: null,
        maxOccurrences: 1,
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
      targetDate: new Date('2024-10-30T10:00:00.000Z'),
      limitDate: new Date('2024-11-05T23:59:59.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);

    const mockOccurrenceAdapter2 = (schedulerService as unknown as { occurrenceAdapter: { createOccurrence: jest.Mock } }).occurrenceAdapter;

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: No next occurrence was created
    expect(mockOccurrenceAdapter2.createOccurrence).not.toHaveBeenCalled();
  });
});

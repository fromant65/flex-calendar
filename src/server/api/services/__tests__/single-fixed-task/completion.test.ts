/**
 * Tests for Single Fixed Task (Fija Única) Completion
 * Verifies that completing the occurrence deactivates the task (isActive=false)
 */

import '../mocks';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence } from '../test-types';

describe('Single Fixed Task Completion', () => {
  let completionService: OccurrenceCompletionService;
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    completeTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getOccurrenceWithTask: jest.Mock;
    completeOccurrence: jest.Mock;
    skipOccurrence: jest.Mock;
  };
  let mockEventAdapter: {
    getEventsByOccurrenceId: jest.Mock;
    completeEvent: jest.Mock;
    deleteEvent: jest.Mock;
    createEvent: jest.Mock;
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
    
    jest.clearAllMocks();
  });

  it('should deactivate task when completing the only occurrence of single fixed task', async () => {
    // Arrange
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Single Fixed Meeting',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        maxOccurrences: 1, // Single fixed task
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
      startDate: new Date('2024-10-30T10:00:00.000Z'),
      targetDate: new Date('2024-10-30T10:00:00.000Z'),
      limitDate: new Date('2024-10-30T10:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const event = {
      id: 1,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
      isCompleted: false,
      start: new Date('2024-10-30T10:00:00.000Z'),
      finish: new Date('2024-10-30T11:00:00.000Z'),
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.completeEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Occurrence was completed
    expect(mockOccurrenceAdapter.completeOccurrence).toHaveBeenCalledTimes(1);
    expect(mockOccurrenceAdapter.completeOccurrence.mock.calls[0]![0]).toBe(occurrenceId);

    // Assert: Associated event was completed
    expect(mockEventAdapter.completeEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.completeEvent.mock.calls[0]![0]).toBe(event.id);

    // Assert: Task was deactivated (isActive = false)
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });

  it('should complete associated calendar event when completing occurrence', async () => {
    const occurrenceId = 2;
    const taskId = 2;
    const eventId = 10;

    const task: MockTask = {
      id: taskId,
      name: 'Fixed Task',
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
      startDate: new Date('2024-11-01T14:00:00.000Z'),
      targetDate: new Date('2024-11-01T14:00:00.000Z'),
      limitDate: new Date('2024-11-01T14:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const event = {
      id: eventId,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
      isCompleted: false,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.completeEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Event was completed
    expect(mockEventAdapter.completeEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.completeEvent.mock.calls[0]![0]).toBe(eventId);
  });

  it('should not create next occurrence when completing or skipping single fixed task', async () => {
    const occurrenceId = 3;
    const taskId = 3;

    const task: MockTask = {
      id: taskId,
      name: 'Single Fixed No Next',
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
      startDate: new Date('2024-11-02T09:00:00.000Z'),
      targetDate: new Date('2024-11-02T09:00:00.000Z'),
      limitDate: new Date('2024-11-02T09:00:00.000Z'),
      status: 'Pending',
      task,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    const mockSchedulerOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: { createOccurrence: jest.Mock } }).occurrenceAdapter;

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: No new occurrence created
    expect(mockSchedulerOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
    
    // Assert: No new event created
    expect(mockEventAdapter.createEvent).not.toHaveBeenCalled();
  });

  it('should delete events when skipping single fixed task occurrence', async () => {
    const occurrenceId = 6;
    const taskId = 6;

    const task: MockTask = {
      id: taskId,
      name: 'Skip Fixed Task',
      isActive: true,
      recurrence: {
        id: 6,
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
      startDate: new Date('2024-11-05T13:00:00.000Z'),
      targetDate: new Date('2024-11-05T13:00:00.000Z'),
      limitDate: new Date('2024-11-05T13:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const event = {
      id: 1,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
    };

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.deleteEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);
    mockTaskAdapter.completeTask.mockResolvedValue(true);

    // Act
    await completionService.skipOccurrence(occurrenceId);

    // Assert: Event was deleted (not completed)
    expect(mockEventAdapter.deleteEvent).toHaveBeenCalledWith(1);
    
    // Assert: Occurrence was skipped
    expect(mockOccurrenceAdapter.skipOccurrence).toHaveBeenCalledWith(occurrenceId);
    
    // Assert: Task was deactivated
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });
});

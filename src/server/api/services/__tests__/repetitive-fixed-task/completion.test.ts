/**
 * Tests for Repetitive Fixed Task (Fija Repetitiva) Completion
 * Verifies that task deactivates after all occurrences are discarded (completed or skipped)
 */

import '../mocks';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence } from '../test-types';

describe('Repetitive Fixed Task Completion', () => {
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
    createOccurrence: jest.Mock;
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
    
    // Access mocked instances from both services
    const completionTaskAdapter = (completionService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const completionOccurrenceAdapter = (completionService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const completionEventAdapter = (completionService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    const schedulerTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const schedulerOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const schedulerRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    // Use completion service adapters as the primary mocks
    mockTaskAdapter = completionTaskAdapter;
    mockOccurrenceAdapter = completionOccurrenceAdapter;
    mockEventAdapter = completionEventAdapter;
    mockRecurrenceRepo = schedulerRecurrenceRepo;
    
    // Ensure scheduler service uses the same mocked functions
    schedulerTaskAdapter.getTaskWithRecurrence = completionTaskAdapter.getTaskWithRecurrence;
    schedulerTaskAdapter.completeTask = completionTaskAdapter.completeTask;
    schedulerOccurrenceAdapter.createOccurrence = completionOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getLatestOccurrenceByTaskId = completionOccurrenceAdapter.getLatestOccurrenceByTaskId;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = completionOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should NOT deactivate task after completing first of N occurrences', async () => {
    // Arrange: Repetitive fixed task with 3 occurrences
    const occurrenceId = 1;
    const taskId = 1;
    const maxOccurrences = 3;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6); // 6 months from now
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(10, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Meeting',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Mon'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    const event = {
      id: 1,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
      isCompleted: false,
    };

    // Only 1 occurrence completed so far
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 2, associatedTaskId: taskId, status: 'Pending' as const },
      { id: 3, associatedTaskId: taskId, status: 'Pending' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.completeEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Task was NOT deactivated
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
    
    // Assert: Event was completed
    expect(mockEventAdapter.completeEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.completeEvent.mock.calls[0]![0]).toBe(1);
  });

  it('should deactivate task after completing all N occurrences', async () => {
    // Arrange: Completing the last of 3 occurrences
    const occurrenceId = 3;
    const taskId = 2;
    const maxOccurrences = 3;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(10, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'Project Reviews',
      isActive: true,
      recurrence: {
        id: 2,
        interval: null,
        maxOccurrences,
        completedOccurrences: 2, // 2 already completed
        lastPeriodStart: null,
        daysOfWeek: ['Mon'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    const event = {
      id: 3,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
      isCompleted: false,
    };

    // All 3 occurrences completed
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 2, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 3, associatedTaskId: taskId, status: 'Completed' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.completeEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Task was deactivated
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
    
    // Assert: Event was completed
    expect(mockEventAdapter.completeEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.completeEvent.mock.calls[0]![0]).toBe(3);
  });

  it('should complete associated calendar events for each occurrence', async () => {
    const occurrenceId = 4;
    const taskId = 3;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(14, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'Team Sync',
      isActive: true,
      recurrence: {
        id: 3,
        interval: null,
        maxOccurrences: 5,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    const event = {
      id: 10,
      associatedOccurrenceId: occurrenceId,
      isFixed: true,
      isCompleted: false,
    };

    const allOccurrences = [
      { id: occurrenceId, associatedTaskId: taskId, status: 'Completed' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([event]);
    mockEventAdapter.completeEvent.mockResolvedValue(true);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Event was completed
    expect(mockEventAdapter.completeEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.completeEvent.mock.calls[0]![0]).toBe(10);
  });

  it('should not create additional occurrences for fixed repetitive tasks', async () => {
    // Fixed repetitive tasks create all occurrences upfront, so no new ones should be created
    const occurrenceId = 6;
    const taskId = 5;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(11, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'No New Occurrences',
      isActive: true,
      recurrence: {
        id: 5,
        interval: null,
        maxOccurrences: 3,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Mon'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    const allOccurrences = [
      { id: occurrenceId, associatedTaskId: taskId, status: 'Completed' as const },
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    const mockSchedulerOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: { createOccurrence: jest.Mock } }).occurrenceAdapter;

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: No new occurrences created
    expect(mockSchedulerOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
    
    // Assert: No new events created
    expect(mockEventAdapter.createEvent).not.toHaveBeenCalled();
  });

  it('should deactivate task when all occurrences are discarded (completed or skipped)', async () => {
    const occurrenceId = 8;
    const taskId = 7;
    const maxOccurrences = 3;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(15, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'Last One',
      isActive: true,
      recurrence: {
        id: 7,
        interval: null,
        maxOccurrences,
        completedOccurrences: 1,
        lastPeriodStart: null,
        daysOfWeek: ['Wed'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    // All occurrences done (2 completed, 1 skipped)
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Completed' as const },
      { id: 2, associatedTaskId: taskId, status: 'Skipped' as const },
      { id: 8, associatedTaskId: taskId, status: 'Completed' as const }, // Current, last one
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockTaskAdapter.completeTask.mockResolvedValue(true);
    mockRecurrenceRepo.updateById.mockResolvedValue(true);

    // Act
    await completionService.completeOccurrence(occurrenceId);

    // Assert: Task deactivated (all occurrences are discarded)
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });

  it('should deactivate task even if all occurrences are skipped', async () => {
    const occurrenceId = 9;
    const taskId = 8;
    const maxOccurrences = 2;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);
    
    const occurrenceDate = new Date(today);
    occurrenceDate.setHours(15, 0, 0, 0);

    const task: MockTask = {
      id: taskId,
      name: 'All Skipped',
      isActive: true,
      recurrence: {
        id: 8,
        interval: null,
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Thu'],
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: occurrenceDate,
      targetDate: occurrenceDate,
      limitDate: occurrenceDate,
      status: 'Pending',
      task,
    };

    // All occurrences skipped
    const allOccurrences = [
      { id: 1, associatedTaskId: taskId, status: 'Skipped' as const },
      { id: 9, associatedTaskId: taskId, status: 'Skipped' as const }, // Current, last one
    ];

    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([]);
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(allOccurrences);
    mockTaskAdapter.completeTask.mockResolvedValue(true);

    // Act
    await completionService.skipOccurrence(occurrenceId);

    // Assert: Task deactivated even though no occurrences were completed
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);
  });
});

/**
 * Tests for Habit Event Skip with Occurrence Checkbox
 * Verifies that when skipping an event with "skip occurrence" checkbox:
 * - The event is deleted
 * - The associated occurrence is marked as skipped
 * - A new occurrence is generated (because habits are infinite)
 */

import '../mocks';
import { EventCompletionService } from '../../events/event-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit Event Skip with Occurrence Checkbox', () => {
  let eventCompletionService: EventCompletionService;
  let occurrenceCompletionService: OccurrenceCompletionService;
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    completeTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getOccurrenceWithTask: jest.Mock;
    getOccurrencesByTaskId: jest.Mock;
    skipOccurrence: jest.Mock;
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
    updateOccurrence: jest.Mock;
  };
  let mockEventAdapter: {
    getEventWithDetails: jest.Mock;
    getEventsByOccurrenceId: jest.Mock;
    deleteEvent: jest.Mock;
    syncOccurrenceTimeFromEvents: jest.Mock;
  };
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    eventCompletionService = new EventCompletionService(schedulerService);
    
    // Access the internal occurrenceCompletionService
    occurrenceCompletionService = (eventCompletionService as any).occurrenceCompletionService;
    
    // Access mocked instances from both services
    const eventEventAdapter = (eventCompletionService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    const eventOccurrenceAdapter = (eventCompletionService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const occurrenceTaskAdapter = (occurrenceCompletionService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const occurrenceOccurrenceAdapter = (occurrenceCompletionService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const occurrenceEventAdapter = (occurrenceCompletionService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    const schedulerTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    const schedulerOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    const schedulerRecurrenceAdapter = (schedulerService as unknown as { recurrenceAdapter: typeof mockRecurrenceAdapter }).recurrenceAdapter;
    
    // Use the adapters as the primary mocks
    mockTaskAdapter = occurrenceTaskAdapter;
    mockOccurrenceAdapter = occurrenceOccurrenceAdapter;
    mockEventAdapter = eventEventAdapter;
    mockRecurrenceAdapter = schedulerRecurrenceAdapter;
    
    // Ensure all services share the same mocked instances
    schedulerTaskAdapter.getTaskWithRecurrence = occurrenceTaskAdapter.getTaskWithRecurrence;
    schedulerOccurrenceAdapter.createOccurrence = occurrenceOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getLatestOccurrenceByTaskId = occurrenceOccurrenceAdapter.getLatestOccurrenceByTaskId;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    // Sync event adapters between EventCompletionService and OccurrenceCompletionService
    occurrenceEventAdapter.getEventsByOccurrenceId = eventEventAdapter.getEventsByOccurrenceId;
    occurrenceEventAdapter.deleteEvent = eventEventAdapter.deleteEvent;
    eventOccurrenceAdapter.getOccurrenceWithTask = occurrenceOccurrenceAdapter.getOccurrenceWithTask;
    eventOccurrenceAdapter.skipOccurrence = occurrenceOccurrenceAdapter.skipOccurrence;
    eventOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should skip event, skip occurrence, and create next occurrence for Habit', async () => {
    // Arrange: Habit with interval, no specific days
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;
    const interval = 7; // Weekly
    const periodStart = new Date('2024-10-21T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Exercise',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: null, // Infinite
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
      startDate: new Date('2024-10-21T00:00:00.000Z'),
      targetDate: new Date('2024-10-22T00:00:00.000Z'),
      limitDate: new Date('2024-10-28T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const eventDetails = {
      id: eventId,
      ownerId: 'user-1',
      associatedOccurrenceId: occurrenceId,
      isFixed: false,
      start: new Date('2024-10-21T10:00:00.000Z'),
      finish: new Date('2024-10-21T11:00:00.000Z'),
      isCompleted: false,
      occurrence: occurrence as any,
    };

    // Setup mocks
    mockEventAdapter.getEventWithDetails.mockResolvedValue(eventDetails);
    mockEventAdapter.deleteEvent.mockResolvedValue(undefined);
    mockEventAdapter.syncOccurrenceTimeFromEvents.mockResolvedValue(undefined);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([eventDetails]);
    
    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue([occurrence]);
    // After skipping, return occurrence as Skipped for shouldCreateNextOccurrence check
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockImplementation(async () => ({
      ...occurrence,
      status: 'Skipped' as const,
    }));
    mockOccurrenceAdapter.updateOccurrence = jest.fn().mockResolvedValue(undefined);
    
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(undefined);

    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act: Skip event with checkbox marked to skip occurrence
    await eventCompletionService.skipCalendarEvent(eventId, true);

    // Assert: Event was deleted
    expect(mockEventAdapter.deleteEvent).toHaveBeenCalledWith(eventId);

    // Assert: Time was synced
    expect(mockEventAdapter.syncOccurrenceTimeFromEvents).toHaveBeenCalledWith(occurrenceId);

    // Assert: Occurrence was skipped
    expect(mockOccurrenceAdapter.skipOccurrence).toHaveBeenCalledWith(occurrenceId);

    // Assert: Period counter was updated
    expect(mockRecurrenceAdapter.updateRecurrence).toHaveBeenCalled();

    // Assert: Next occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);
  });

  it('should skip event but NOT skip occurrence when checkbox is not marked for non-fixed task', async () => {
    // Arrange
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Exercise',
      isActive: true,
      recurrence: {
        id: 1,
        interval: 7,
        maxOccurrences: null,
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
      targetDate: new Date('2024-10-22T00:00:00.000Z'),
      limitDate: new Date('2024-10-28T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const eventDetails = {
      id: eventId,
      ownerId: 'user-1',
      associatedOccurrenceId: occurrenceId,
      isFixed: false,
      start: new Date('2024-10-21T10:00:00.000Z'),
      finish: new Date('2024-10-21T11:00:00.000Z'),
      isCompleted: false,
      occurrence: occurrence as any,
    };

    // Setup mocks
    mockEventAdapter.getEventWithDetails.mockResolvedValue(eventDetails);
    mockEventAdapter.deleteEvent.mockResolvedValue(undefined);
    mockEventAdapter.syncOccurrenceTimeFromEvents.mockResolvedValue(undefined);
    
    mockOccurrenceAdapter.skipOccurrence.mockResolvedValue(true);

    // Act: Skip event WITHOUT checkbox (skipOccurrence = false or undefined)
    await eventCompletionService.skipCalendarEvent(eventId, false);

    // Assert: Event was deleted
    expect(mockEventAdapter.deleteEvent).toHaveBeenCalledWith(eventId);

    // Assert: Time was synced
    expect(mockEventAdapter.syncOccurrenceTimeFromEvents).toHaveBeenCalledWith(occurrenceId);

    // Assert: Occurrence was NOT skipped (checkbox not marked)
    expect(mockOccurrenceAdapter.skipOccurrence).not.toHaveBeenCalled();
  });
});

/**
 * Tests for Single Task Event Completion with Occurrence Checkbox
 * Verifies that when completing an event with "complete occurrence" checkbox:
 * - The event is marked as completed
 * - The associated occurrence is marked as completed
 * - The task is completed (single tasks have only one occurrence)
 */

import '../mocks';
import { EventCompletionService } from '../../events/event-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import type { MockTask, MockOccurrence } from '../test-types';

describe('Single Task Event Completion with Occurrence Checkbox', () => {
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
    completeOccurrence: jest.Mock;
    createOccurrence: jest.Mock;
    updateOccurrence: jest.Mock;
  };
  let mockEventAdapter: {
    getEventWithDetails: jest.Mock;
    getEventsByOccurrenceId: jest.Mock;
    updateEvent: jest.Mock;
    completeEvent: jest.Mock;
    syncOccurrenceTimeFromEvents: jest.Mock;
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
    
    // Use the adapters as the primary mocks
    mockTaskAdapter = occurrenceTaskAdapter;
    mockOccurrenceAdapter = occurrenceOccurrenceAdapter;
    mockEventAdapter = eventEventAdapter; // From EventCompletionService
    
    // Ensure all services share the same mocked instances
    schedulerTaskAdapter.getTaskWithRecurrence = occurrenceTaskAdapter.getTaskWithRecurrence;
    schedulerTaskAdapter.completeTask = occurrenceTaskAdapter.completeTask;
    schedulerOccurrenceAdapter.createOccurrence = occurrenceOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    // Sync event adapters between EventCompletionService and OccurrenceCompletionService
    occurrenceEventAdapter.getEventsByOccurrenceId = eventEventAdapter.getEventsByOccurrenceId;
    occurrenceEventAdapter.completeEvent = eventEventAdapter.completeEvent;
    eventOccurrenceAdapter.getOccurrenceWithTask = occurrenceOccurrenceAdapter.getOccurrenceWithTask;
    eventOccurrenceAdapter.completeOccurrence = occurrenceOccurrenceAdapter.completeOccurrence;
    eventOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should complete event, complete occurrence, and complete task for Single Task', async () => {
    // Arrange: Single task (maxOccurrences = 1, no interval)
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Buy Groceries',
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
    mockEventAdapter.updateEvent.mockResolvedValue({ ...eventDetails, isCompleted: true });
    mockEventAdapter.syncOccurrenceTimeFromEvents.mockResolvedValue(undefined);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([eventDetails]);
    mockEventAdapter.completeEvent.mockResolvedValue(undefined);
    
    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue([occurrence]);
    
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockTaskAdapter.completeTask.mockResolvedValue(undefined);

    // Act: Complete event with checkbox marked
    await eventCompletionService.completeCalendarEvent(eventId, undefined, true);

    // Assert: Event was updated as completed
    expect(mockEventAdapter.updateEvent).toHaveBeenCalledWith(
      eventId,
      expect.objectContaining({ isCompleted: true })
    );

    // Assert: Time was synced
    expect(mockEventAdapter.syncOccurrenceTimeFromEvents).toHaveBeenCalledWith(occurrenceId);

    // Assert: Occurrence was completed
    expect(mockOccurrenceAdapter.completeOccurrence).toHaveBeenCalledWith(
      occurrenceId,
      expect.any(Date)
    );

    // Assert: Task was completed (single tasks complete when occurrence completes)
    expect(mockTaskAdapter.completeTask).toHaveBeenCalledWith(taskId);

    // Assert: No new occurrence was created (single tasks have only one)
    expect(mockOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
  });

  it('should NOT complete occurrence if checkbox is not marked', async () => {
    // Arrange
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Buy Groceries',
      isActive: true,
      recurrence: {
        id: 1,
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
    mockEventAdapter.updateEvent.mockResolvedValue({ ...eventDetails, isCompleted: true });
    mockEventAdapter.syncOccurrenceTimeFromEvents.mockResolvedValue(undefined);

    // Act: Complete event WITHOUT checkbox
    await eventCompletionService.completeCalendarEvent(eventId, undefined, false);

    // Assert: Event was completed
    expect(mockEventAdapter.updateEvent).toHaveBeenCalledWith(
      eventId,
      expect.objectContaining({ isCompleted: true })
    );

    // Assert: Occurrence was NOT completed
    expect(mockOccurrenceAdapter.completeOccurrence).not.toHaveBeenCalled();

    // Assert: Task was NOT completed
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });

  it('should handle event without target date', async () => {
    // Arrange: Single task without specific target/limit dates
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;

    const task: MockTask = {
      id: taskId,
      name: 'Quick Task',
      isActive: true,
      recurrence: {
        id: 1,
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
      startDate: new Date('2024-10-21T00:00:00.000Z'),
      targetDate: new Date('2024-10-21T00:00:00.000Z'),
      limitDate: new Date('2024-10-21T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const eventDetails = {
      id: eventId,
      ownerId: 'user-1',
      associatedOccurrenceId: occurrenceId,
      isFixed: false,
      start: new Date('2024-10-21T14:00:00.000Z'),
      finish: new Date('2024-10-21T15:00:00.000Z'),
      isCompleted: false,
      occurrence: occurrence as any,
    };

    // Setup mocks
    mockEventAdapter.getEventWithDetails.mockResolvedValue(eventDetails);
    mockEventAdapter.updateEvent.mockResolvedValue({ ...eventDetails, isCompleted: true });
    mockEventAdapter.syncOccurrenceTimeFromEvents.mockResolvedValue(undefined);
    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([eventDetails]);
    mockEventAdapter.completeEvent.mockResolvedValue(undefined);
    
    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(occurrence);
    mockOccurrenceAdapter.completeOccurrence.mockResolvedValue(true);
    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue([occurrence]);
    
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockTaskAdapter.completeTask.mockResolvedValue(undefined);

    // Act
    await eventCompletionService.completeCalendarEvent(eventId, undefined, true);

    // Assert: Everything still works correctly
    expect(mockOccurrenceAdapter.completeOccurrence).toHaveBeenCalled();
    expect(mockTaskAdapter.completeTask).toHaveBeenCalled();
  });
});

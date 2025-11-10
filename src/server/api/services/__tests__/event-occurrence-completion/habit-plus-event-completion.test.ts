/**
 * Tests for Habit Plus Event Completion with Occurrence Checkbox
 * Verifies that when completing an event with "complete occurrence" checkbox:
 * - The event is marked as completed
 * - The associated occurrence is marked as completed
 * - A new occurrence is generated (because habit+ are infinite)
 * - Period counters are incremented correctly
 */

import '../mocks';
import { EventCompletionService } from '../../events/event-completion.service';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import { OccurrenceCompletionService } from '../../occurrences/occurrence-completion.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit Plus Event Completion with Occurrence Checkbox', () => {
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
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
    updateOccurrence: jest.Mock;
  };
  let mockEventAdapter: {
    getEventWithDetails: jest.Mock;
    getEventsByOccurrenceId: jest.Mock;
    updateEvent: jest.Mock;
    completeEvent: jest.Mock;
    syncOccurrenceTimeFromEvents: jest.Mock;
  };
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
    incrementCompletedOccurrences: jest.Mock;
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
    mockEventAdapter = eventEventAdapter; // From EventCompletionService
    mockRecurrenceAdapter = schedulerRecurrenceAdapter;
    
    // Ensure all services share the same mocked instances
    schedulerTaskAdapter.getTaskWithRecurrence = occurrenceTaskAdapter.getTaskWithRecurrence;
    schedulerTaskAdapter.completeTask = occurrenceTaskAdapter.completeTask;
    schedulerOccurrenceAdapter.createOccurrence = occurrenceOccurrenceAdapter.createOccurrence;
    schedulerOccurrenceAdapter.getLatestOccurrenceByTaskId = occurrenceOccurrenceAdapter.getLatestOccurrenceByTaskId;
    schedulerOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    // Sync event adapters between EventCompletionService and OccurrenceCompletionService
    occurrenceEventAdapter.getEventsByOccurrenceId = eventEventAdapter.getEventsByOccurrenceId;
    occurrenceEventAdapter.completeEvent = eventEventAdapter.completeEvent;
    eventOccurrenceAdapter.getOccurrenceWithTask = occurrenceOccurrenceAdapter.getOccurrenceWithTask;
    eventOccurrenceAdapter.completeOccurrence = occurrenceOccurrenceAdapter.completeOccurrence;
    eventOccurrenceAdapter.getOccurrencesByTaskId = occurrenceOccurrenceAdapter.getOccurrencesByTaskId;
    
    jest.clearAllMocks();
  });

  it('should complete event, complete occurrence, and create next occurrence for Habit+', async () => {
    // Arrange: Habit+ with interval and specific days
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;
    const interval = 7; // Weekly
    const periodStart = new Date('2024-10-21T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Habit+',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: 3, // 3 times per week = Habit+
        completedOccurrences: 0,
        lastPeriodStart: periodStart,
        daysOfWeek: ['Mon', 'Wed', 'Fri'], // Specific days = Habit+
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-21T00:00:00.000Z'), // Monday
      targetDate: new Date('2024-10-22T00:00:00.000Z'),
      limitDate: new Date('2024-10-23T00:00:00.000Z'),
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
    // After completion, return occurrence as Completed for shouldCreateNextOccurrence check
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockImplementation(async () => ({
      ...occurrence,
      status: 'Completed' as const,
    }));
    mockOccurrenceAdapter.updateOccurrence = jest.fn().mockResolvedValue(undefined);
    
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(undefined);
    mockRecurrenceAdapter.incrementCompletedOccurrences.mockResolvedValue(undefined);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(undefined);

    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act: Complete event with checkbox marked to complete occurrence
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

    // Assert: Period counter was updated (this is the key for Habit+)
    expect(mockRecurrenceAdapter.updateRecurrence).toHaveBeenCalled();

    // Assert: Next occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);

    // Assert: Task was NOT completed (habit+ are infinite)
    expect(mockTaskAdapter.completeTask).not.toHaveBeenCalled();
  });

  it('should handle period transitions correctly when completing last occurrence of period', async () => {
    // Arrange: Habit+ at the end of a period (2 of 3 already completed)
    const eventId = 1;
    const occurrenceId = 3;
    const taskId = 1;
    const interval = 7;
    const periodStart = new Date('2024-10-21T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Habit+',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: 3, // 3 times per week
        completedOccurrences: 2, // Already completed 2
        lastPeriodStart: periodStart,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-25T00:00:00.000Z'), // Friday (last day)
      targetDate: new Date('2024-10-26T00:00:00.000Z'),
      limitDate: new Date('2024-10-27T00:00:00.000Z'),
      status: 'Pending',
      task,
    };

    const eventDetails = {
      id: eventId,
      ownerId: 'user-1',
      associatedOccurrenceId: occurrenceId,
      isFixed: false,
      start: new Date('2024-10-25T14:00:00.000Z'),
      finish: new Date('2024-10-25T15:00:00.000Z'),
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
    // After completion, return occurrence as Completed for shouldCreateNextOccurrence check
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockImplementation(async () => ({
      ...occurrence,
      status: 'Completed' as const,
    }));
    mockOccurrenceAdapter.updateOccurrence = jest.fn().mockResolvedValue(undefined);
    
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    
    // After increment, completedOccurrences will be 3 (reached limit)
    const updatedRecurrence = { ...task.recurrence, completedOccurrences: 3 };
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(updatedRecurrence);
    mockRecurrenceAdapter.incrementCompletedOccurrences.mockResolvedValue(undefined);
    mockRecurrenceAdapter.updateRecurrence.mockResolvedValue(undefined);

    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 4, status: 'Pending' as const };
    });

    // Act
    await eventCompletionService.completeCalendarEvent(eventId, undefined, true);

    // Assert: Next occurrence created (should be in next period)
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    
    // The new occurrence should be after the period end
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + interval);
    expect(capturedOccurrence?.startDate.getTime()).toBeGreaterThanOrEqual(periodEnd.getTime());

    // Assert: Period was transitioned (counter reset)
    expect(mockRecurrenceAdapter.updateRecurrence).toHaveBeenCalledWith(
      task.recurrence.id,
      expect.objectContaining({
        completedOccurrences: 0, // Reset
        lastPeriodStart: periodEnd, // New period start
      })
    );
  });

  it('should NOT complete occurrence if checkbox is not marked', async () => {
    // Arrange
    const eventId = 1;
    const occurrenceId = 1;
    const taskId = 1;
    const interval = 7;
    const periodStart = new Date('2024-10-21T00:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Habit+',
      isActive: true,
      recurrence: {
        id: 1,
        interval,
        maxOccurrences: 3,
        completedOccurrences: 0,
        lastPeriodStart: periodStart,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        endDate: null,
      },
    };

    const occurrence: MockOccurrence = {
      id: occurrenceId,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-21T00:00:00.000Z'),
      targetDate: new Date('2024-10-22T00:00:00.000Z'),
      limitDate: new Date('2024-10-23T00:00:00.000Z'),
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

    // Assert: Next occurrence was NOT created
    expect(mockOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
  });
});

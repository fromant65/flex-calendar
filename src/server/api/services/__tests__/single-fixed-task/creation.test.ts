/**
 * Tests for Single Fixed Task (Fija Única) Creation
 * Verifies that creating this type creates 1 occurrence and 1 event
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask } from '../test-types';

describe('Single Fixed Task Creation', () => {
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    createOccurrence: jest.Mock;
  };
  let mockEventAdapter: {
    createEvent: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    // Access mocked instances
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockEventAdapter = (schedulerService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    jest.clearAllMocks();
  });

  it('should create one occurrence and one event for single fixed task', async () => {
    // Arrange: Single fixed task
    const taskId = 1;
    const userId = 'test-user-1';
    const fixedStartTime = '10:00:00';
    const fixedEndTime = '11:00:00';
    const targetDate = new Date('2024-10-30T10:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Single Fixed Meeting',
      taskType: 'Fija Única',
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

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 1,
      associatedTaskId: taskId,
      startDate: targetDate,
      targetDate,
      limitDate: targetDate,
      status: 'Pending',
    });
    mockEventAdapter.createEvent.mockResolvedValue({
      id: 1,
      associatedOccurrenceId: 1,
      associatedOwnerId: userId,
      isFixed: true,
      isCompleted: false,
      start: new Date('2024-10-30T10:00:00.000Z'),
      finish: new Date('2024-10-30T11:00:00.000Z'),
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      fixedStartTime,
      fixedEndTime,
      recurrence: {
        maxOccurrences: 1,
      },
    });

    // Assert: Exactly one occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    
    // Assert: Exactly one event was created
    expect(mockEventAdapter.createEvent).toHaveBeenCalledTimes(1);
    expect(mockEventAdapter.createEvent).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        associatedOccurrenceId: 1,
        isFixed: true,
      })
    );
  });

  it('should verify created event has correct time fields', async () => {
    const taskId = 2;
    const userId = 'test-user-2';
    const fixedStartTime = '14:00:00';
    const fixedEndTime = '15:30:00';

    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 2,
      associatedTaskId: taskId,
      startDate: new Date(),
      targetDate: new Date(),
      limitDate: new Date(),
      status: 'Pending',
    });

    let capturedEvent: any;
    mockEventAdapter.createEvent.mockImplementation(async (ownerId: string, data: any) => {
      capturedEvent = data;
      return { ...data, id: 2, isCompleted: false };
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      fixedStartTime,
      fixedEndTime,
      recurrence: {
        maxOccurrences: 1,
      },
    });

    // Assert: Event has correct time fields
    expect(capturedEvent).toBeDefined();
    expect(capturedEvent.isFixed).toBe(true);
    expect(capturedEvent.start).toBeDefined();
    expect(capturedEvent.finish).toBeDefined();
  });

  it('should create occurrence with correct date for single fixed task', async () => {
    const taskId = 3;
    const userId = 'test-user-3';
    const targetDate = new Date('2024-11-01T09:00:00.000Z');

    let capturedOccurrence: any;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: any) => {
      capturedOccurrence = data;
      return { ...data, id: 3, status: 'Pending' };
    });
    mockEventAdapter.createEvent.mockResolvedValue({
      id: 3,
      isCompleted: false,
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      fixedStartTime: '09:00:00',
      fixedEndTime: '10:00:00',
      recurrence: {
        maxOccurrences: 1,
        // For single fixed task, can optionally have targetDate
      },
    });

    // Assert: Occurrence was created
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence.associatedTaskId).toBe(taskId);
    expect(capturedOccurrence.startDate).toBeDefined();
  });
});

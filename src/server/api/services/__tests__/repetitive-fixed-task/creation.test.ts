/**
 * Tests for Repetitive Fixed Task (Fija Repetitiva) Creation
 * Verifies that creating this type creates N occurrences and N events
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask } from '../test-types';

describe('Repetitive Fixed Task Creation', () => {
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

  it('should create N occurrences and N events for repetitive fixed task', async () => {
    // Arrange: Repetitive fixed task with 3 occurrences
    const taskId = 1;
    const userId = 'test-user-1';
    const maxOccurrences = 3;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);

    const task: MockTask = {
      id: taskId,
      name: 'Weekly Meeting',
      taskType: 'Fija Repetitiva',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null,
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Mon'], // Every Monday
        daysOfMonth: null,
        endDate: futureEndDate,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    
    // Mock createOccurrence to return different occurrences
    let occurrenceCount = 0;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: any) => {
      occurrenceCount++;
      return {
        ...data,
        id: occurrenceCount,
        status: 'Pending',
      };
    });

    // Mock createEvent
    let eventCount = 0;
    mockEventAdapter.createEvent.mockImplementation(async (ownerId: string, data: any) => {
      eventCount++;
      return {
        ...data,
        id: eventCount,
        isCompleted: false,
      };
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      startDateTime: new Date('2024-10-30T10:00:00.000Z'),
      endDateTime: new Date('2024-10-30T11:00:00.000Z'),
      recurrence: {
        maxOccurrences,
        daysOfWeek: ['Mon'],
        endDate: futureEndDate,
      },
    });

    // Assert: N occurrences were created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(maxOccurrences);
    
    // Assert: N events were created
    expect(mockEventAdapter.createEvent).toHaveBeenCalledTimes(maxOccurrences);
  });

  it('should verify created events have correct fields for repetitive fixed task', async () => {
    const taskId = 2;
    const userId = 'test-user-2';
    const maxOccurrences = 2;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);

    let occurrenceId = 0;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: any) => {
      occurrenceId++;
      return { ...data, id: occurrenceId, status: 'Pending' };
    });

    const capturedEvents: any[] = [];
    mockEventAdapter.createEvent.mockImplementation(async (ownerId: string, data: any) => {
      capturedEvents.push(data);
      return { ...data, id: capturedEvents.length, isCompleted: false };
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      startDateTime: new Date('2024-10-30T14:00:00.000Z'),
      endDateTime: new Date('2024-10-30T15:30:00.000Z'),
      recurrence: {
        maxOccurrences,
        daysOfWeek: ['Wed', 'Fri'],
        endDate: futureEndDate,
      },
    });

    // Assert: Events have correct fields
    expect(capturedEvents.length).toBe(maxOccurrences);
    capturedEvents.forEach(event => {
      expect(event.isFixed).toBe(true);
      expect(event.associatedOccurrenceId).toBeDefined();
      expect(event.start).toBeDefined();
      expect(event.finish).toBeDefined();
    });
  });

  it('should respect maxOccurrences limit', async () => {
    const taskId = 3;
    const userId = 'test-user-3';
    const maxOccurrences = 5;

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);

    let occurrenceCount = 0;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async () => {
      occurrenceCount++;
      return { id: occurrenceCount, status: 'Pending' } as any;
    });

    let eventCount = 0;
    mockEventAdapter.createEvent.mockImplementation(async () => {
      eventCount++;
      return { id: eventCount, isCompleted: false } as any;
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      startDateTime: new Date('2024-10-30T09:00:00.000Z'),
      endDateTime: new Date('2024-10-30T10:00:00.000Z'),
      recurrence: {
        maxOccurrences,
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Could generate many
        endDate: futureEndDate,
      },
    });

    // Assert: Only maxOccurrences were created (not more)
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(maxOccurrences);
    expect(mockEventAdapter.createEvent).toHaveBeenCalledTimes(maxOccurrences);
  });

  it('should create events for specific days of week', async () => {
    const taskId = 4;
    const userId = 'test-user-4';

    // Use relative dates
    const today = new Date();
    const futureEndDate = new Date(today);
    futureEndDate.setMonth(futureEndDate.getMonth() + 6);

    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: any) => {
      return { ...data, id: 1, status: 'Pending' };
    });
    mockEventAdapter.createEvent.mockImplementation(async (ownerId: string, data: any) => {
      return { ...data, id: 1, isCompleted: false };
    });

    // Act
    await schedulerService.createFixedTaskEvents(taskId, userId, {
      startDateTime: new Date('2024-10-30T10:00:00.000Z'),
      endDateTime: new Date('2024-10-30T11:00:00.000Z'),
      recurrence: {
        maxOccurrences: 3,
        daysOfWeek: ['Mon', 'Wed', 'Fri'], // Specific days
        endDate: futureEndDate,
      },
    });

    // Assert: Occurrences and events created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalled();
    expect(mockEventAdapter.createEvent).toHaveBeenCalled();
  });
});

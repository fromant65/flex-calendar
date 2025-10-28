/**
 * Tests for Single Task (Tarea Única) Creation
 * Verifies that creating this type creates 1 occurrence and no events
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Single Task Creation', () => {
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
    updateTask: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
    getOccurrencesByTaskId: jest.Mock;
  };
  let mockEventAdapter: {
    createEvent: jest.Mock;
    getEventsByOccurrenceId: jest.Mock;
  };
  let mockRecurrenceRepo: {
    findById: jest.Mock;
    updateById: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    // Access mocked instances
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockEventAdapter = (schedulerService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    jest.clearAllMocks();
  });

  it('should create only one occurrence for single task', async () => {
    // Arrange: Single task with maxOccurrences = 1
    const taskId = 1;
    const targetDate = new Date('2024-10-30T10:00:00.000Z');
    const limitDate = new Date('2024-11-05T23:59:59.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Single Task Test',
      taskType: 'Tarea Única',
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

    // Mock: No previous occurrences
    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 1, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId, {
      targetDate,
      limitDate,
      targetTimeConsumption: 120,
    });

    // Assert: Exactly one occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);
    expect(capturedOccurrence?.targetDate).toEqual(targetDate);
    expect(capturedOccurrence?.limitDate).toEqual(limitDate);
    expect(capturedOccurrence?.targetTimeConsumption).toBe(120);
    
    // Assert: No events were created
    expect(mockEventAdapter.createEvent).not.toHaveBeenCalled();
  });

  it('should verify created occurrence has correct fields', async () => {
    const taskId = 2;
    const targetDate = new Date('2024-11-01T14:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      name: 'Task with Fields',
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

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId, { targetDate });

    // Assert: Verify fields
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);
    expect(capturedOccurrence?.startDate).toBeDefined();
    expect(capturedOccurrence?.targetDate).toEqual(targetDate);
    expect(capturedOccurrence?.limitDate).toBeDefined();
  });

  it('should not create occurrence if one already exists for single task', async () => {
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

    const existingOccurrence: MockOccurrence = {
      id: 1,
      associatedTaskId: taskId,
      startDate: new Date('2024-10-28T00:00:00.000Z'),
      targetDate: new Date('2024-10-30T00:00:00.000Z'),
      limitDate: new Date('2024-11-01T00:00:00.000Z'),
      status: 'Pending',
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(existingOccurrence);
    mockRecurrenceRepo.findById.mockResolvedValue(task.recurrence);

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert: No new occurrence created (already has one)
    expect(mockOccurrenceAdapter.createOccurrence).not.toHaveBeenCalled();
  });
});

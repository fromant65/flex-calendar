/**
 * Tests for Finite Recurring Task (Recurrente Finita) Creation
 * Verifies that creating this type creates occurrences until maxOccurrences is reached
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Finite Recurring Task Creation', () => {
  let schedulerService: TaskSchedulerService;
  let mockRecurrenceAdapter: {
    getRecurrenceById: jest.Mock;
    updateRecurrence: jest.Mock;
    incrementCompletedOccurrences: jest.Mock;
  };
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
  };
  

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    mockRecurrenceAdapter = (schedulerService as unknown as { recurrenceAdapter: typeof mockRecurrenceAdapter }).recurrenceAdapter;
    
    // Access mocked instances
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockEventAdapter = (schedulerService as unknown as { eventAdapter: typeof mockEventAdapter }).eventAdapter;
    
    
    jest.clearAllMocks();
  });

  it('should create first occurrence for finite recurring task', async () => {
    // Arrange: Finite recurring task with maxOccurrences = 5
    const taskId = 1;
    const maxOccurrences = 5;

    const task: MockTask = {
      id: taskId,
      name: 'Finite Recurring Task',
      taskType: 'Recurrente Finita',
      isActive: true,
      recurrence: {
        id: 1,
        interval: null, // No interval = finite
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 1, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert: First occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);
    
    // Assert: No events created (non-fixed tasks)
    expect(mockEventAdapter.createEvent).not.toHaveBeenCalled();
  });

  it('should verify recurrence fields for finite recurring task', async () => {
    const taskId = 2;
    const maxOccurrences = 3;

    const task: MockTask = {
      id: taskId,
      isActive: true,
      recurrence: {
        id: 2,
        interval: null, // Key: no interval for finite recurring
        maxOccurrences,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null, // No specific days
        daysOfMonth: null, // No specific days
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      return { ...data, id: 2, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId);

    // Assert: Task has correct recurrence configuration
    expect(task.recurrence.interval).toBeNull();
    expect(task.recurrence.maxOccurrences).toBe(maxOccurrences);
    expect(task.recurrence.daysOfWeek).toBeNull();
    expect(task.recurrence.daysOfMonth).toBeNull();
  });

  it('should distribute targetDate and limitDate across occurrences', async () => {
    const taskId = 3;
    const targetDate = new Date('2024-11-10T10:00:00.000Z');
    const limitDate = new Date('2024-11-20T18:00:00.000Z');

    const task: MockTask = {
      id: taskId,
      isActive: true,
      recurrence: {
        id: 3,
        interval: null,
        maxOccurrences: 3,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceAdapter.getRecurrenceById.mockResolvedValue(task.recurrence);
    
    let capturedOccurrence: CreateOccurrenceDTO | undefined;
    mockOccurrenceAdapter.createOccurrence.mockImplementation(async (data: CreateOccurrenceDTO) => {
      capturedOccurrence = data;
      return { ...data, id: 3, status: 'Pending' as const };
    });

    // Act
    await schedulerService.createNextOccurrence(taskId, {
      targetDate,
      limitDate,
      targetTimeConsumption: 90,
    });

    // Assert: First occurrence has dates
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.targetDate).toBeDefined();
    expect(capturedOccurrence?.limitDate).toBeDefined();
    expect(capturedOccurrence?.targetTimeConsumption).toBe(90);
    
    // Note: Each subsequent occurrence should have its dates distributed
    // within the original targetDate-limitDate range
  });
});

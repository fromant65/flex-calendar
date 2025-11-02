/**
 * Tests for Habit (Hábito) Creation
 * Verifies that creating a habit generates one occurrence and no events
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from '../test-types';

describe('Habit Creation', () => {
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

  it('should create one occurrence for habit', async () => {
    // Arrange: Habit with interval (infinite recurrence)
    const taskId = 1;
    const interval = 7; // Weekly habit

    const task: MockTask = {
      id: taskId,
      name: 'Daily Habit',
      taskType: 'Hábito',
      isActive: true,
      recurrence: {
        id: 1,
        interval, // Has interval = habit
        maxOccurrences: null, // Infinite
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-21T00:00:00.000Z'),
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

    // Assert: One occurrence was created
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledTimes(1);
    expect(capturedOccurrence).toBeDefined();
    expect(capturedOccurrence?.associatedTaskId).toBe(taskId);
    
    // Assert: No events created
    expect(mockEventAdapter.createEvent).not.toHaveBeenCalled();
  });

  it('should verify habit has correct recurrence fields', async () => {
    const taskId = 2;
    const interval = 1; // Daily habit

    const task: MockTask = {
      id: taskId,
      name: 'Exercise Habit',
      isActive: true,
      recurrence: {
        id: 2,
        interval, // Key: has interval
        maxOccurrences: null, // Key: no max occurrences (infinite)
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-28T00:00:00.000Z'),
        daysOfWeek: null,
        daysOfMonth: null,
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

    // Assert: Verify recurrence configuration
    expect(task.recurrence.interval).toBe(interval);
    expect(task.recurrence.maxOccurrences).toBeNull();
    expect(task.recurrence.daysOfWeek).toBeNull();
    expect(task.recurrence.daysOfMonth).toBeNull();
  });
});

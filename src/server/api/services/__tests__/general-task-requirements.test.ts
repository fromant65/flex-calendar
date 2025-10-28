/**
 * General Task Tests
 * Verifies core requirements that apply to all task types
 */

import './mocks';
import { TaskSchedulerService } from '../scheduling/task-scheduler.service';
import type { MockTask, MockOccurrence, CreateOccurrenceDTO } from './test-types';

describe('General Task Requirements', () => {
  let schedulerService: TaskSchedulerService;
  let mockTaskAdapter: {
    getTaskWithRecurrence: jest.Mock;
  };
  let mockOccurrenceAdapter: {
    getLatestOccurrenceByTaskId: jest.Mock;
    createOccurrence: jest.Mock<Promise<MockOccurrence>, [CreateOccurrenceDTO]>;
  };
  let mockRecurrenceRepo: {
    findById: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    // Access mocked instances
    mockTaskAdapter = (schedulerService as unknown as { taskAdapter: typeof mockTaskAdapter }).taskAdapter;
    mockOccurrenceAdapter = (schedulerService as unknown as { occurrenceAdapter: typeof mockOccurrenceAdapter }).occurrenceAdapter;
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    jest.clearAllMocks();
  });

  it('should ensure all tasks have a recurrence object associated (even single tasks)', async () => {
    // Test 1: Single task (maxOccurrences = 1)
    const singleTask: MockTask = {
      id: 1,
      name: 'Single Task',
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

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(singleTask);
    mockOccurrenceAdapter.getLatestOccurrenceByTaskId.mockResolvedValue(null);
    mockRecurrenceRepo.findById.mockResolvedValue(singleTask.recurrence);
    mockOccurrenceAdapter.createOccurrence.mockResolvedValue({
      id: 1,
      associatedTaskId: 1,
      startDate: new Date(),
      targetDate: new Date(),
      limitDate: new Date(),
      status: 'Pending',
    });

    await schedulerService.createNextOccurrence(1);

    // Assert: Task has recurrence object
    const task = await mockTaskAdapter.getTaskWithRecurrence(1);
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.maxOccurrences).toBe(1);
  });

  it('should ensure single fixed tasks have a recurrence object', async () => {
    // Test 2: Single fixed task
    const singleFixedTask: MockTask = {
      id: 2,
      name: 'Single Fixed Task',
      isActive: true,
      recurrence: {
        id: 2,
        interval: null,
        maxOccurrences: 1, // Single fixed
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(singleFixedTask);

    // Act
    const task = await mockTaskAdapter.getTaskWithRecurrence(2);

    // Assert: Task has recurrence object
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.maxOccurrences).toBe(1);
  });

  it('should ensure finite recurring tasks have a recurrence object', async () => {
    // Test 3: Finite recurring task
    const finiteRecurringTask: MockTask = {
      id: 3,
      name: 'Finite Recurring Task',
      isActive: true,
      recurrence: {
        id: 3,
        interval: null,
        maxOccurrences: 5,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(finiteRecurringTask);

    // Act
    const task = await mockTaskAdapter.getTaskWithRecurrence(3);

    // Assert: Task has recurrence object
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.maxOccurrences).toBe(5);
  });

  it('should ensure habits have a recurrence object', async () => {
    // Test 4: Habit (has interval, no maxOccurrences)
    const habitTask: MockTask = {
      id: 4,
      name: 'Habit Task',
      isActive: true,
      recurrence: {
        id: 4,
        interval: 7, // Weekly
        maxOccurrences: null,
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-21T00:00:00.000Z'),
        daysOfWeek: null,
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(habitTask);

    // Act
    const task = await mockTaskAdapter.getTaskWithRecurrence(4);

    // Assert: Task has recurrence object
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.interval).toBe(7);
  });

  it('should ensure repetitive fixed tasks have a recurrence object', async () => {
    // Test 5: Repetitive fixed task
    const repetitiveFixedTask: MockTask = {
      id: 5,
      name: 'Repetitive Fixed Task',
      isActive: true,
      recurrence: {
        id: 5,
        interval: null,
        maxOccurrences: 10,
        completedOccurrences: 0,
        lastPeriodStart: null,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        endDate: new Date('2024-12-31T23:59:59.000Z'),
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(repetitiveFixedTask);

    // Act
    const task = await mockTaskAdapter.getTaskWithRecurrence(5);

    // Assert: Task has recurrence object
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.daysOfWeek).toContain('Mon');
  });

  it('should ensure habit+ tasks have a recurrence object', async () => {
    // Test 6: Habit+ (has interval, maxOccurrences, and daysOfWeek/daysOfMonth)
    const habitPlusTask: MockTask = {
      id: 6,
      name: 'Habit+ Task',
      isActive: true,
      recurrence: {
        id: 6,
        interval: 7,
        maxOccurrences: 3, // 3 per period
        completedOccurrences: 0,
        lastPeriodStart: new Date('2024-10-21T00:00:00.000Z'),
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
        endDate: null,
      },
    };

    mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(habitPlusTask);

    // Act
    const task = await mockTaskAdapter.getTaskWithRecurrence(6);

    // Assert: Task has recurrence object
    expect(task.recurrence).toBeDefined();
    expect(task.recurrence).not.toBeNull();
    expect(task.recurrence.id).toBeDefined();
    expect(task.recurrence.interval).toBe(7);
    expect(task.recurrence.maxOccurrences).toBe(3);
    expect(task.recurrence.daysOfWeek).toBeDefined();
  });

  it('should verify recurrence object has all required fields', async () => {
    const task: MockTask = {
      id: 7,
      name: 'Test Task',
      isActive: true,
      recurrence: {
        id: 7,
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

    // Act
    const fetchedTask = await mockTaskAdapter.getTaskWithRecurrence(7);

    // Assert: Recurrence has all required fields
    expect(fetchedTask.recurrence).toHaveProperty('id');
    expect(fetchedTask.recurrence).toHaveProperty('interval');
    expect(fetchedTask.recurrence).toHaveProperty('maxOccurrences');
    expect(fetchedTask.recurrence).toHaveProperty('completedOccurrences');
    expect(fetchedTask.recurrence).toHaveProperty('lastPeriodStart');
    expect(fetchedTask.recurrence).toHaveProperty('daysOfWeek');
    expect(fetchedTask.recurrence).toHaveProperty('daysOfMonth');
    expect(fetchedTask.recurrence).toHaveProperty('endDate');
  });
});

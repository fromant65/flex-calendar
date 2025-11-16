import './mocks';
import { TaskManagementService } from '../tasks/task-management.service';
import { TaskAdapter, OccurrenceAdapter, CalendarEventAdapter } from '../../adapter';
import type { CreateTaskDTO, TaskOccurrence, CalendarEvent } from '../../../../types';
import { makeTaskWithRecurrence, makeTaskOccurrence, makeCreateTaskDTO } from './fixtures';

describe('TaskManagementService', () => {
  let service: TaskManagementService;
  let mockTaskAdapter: jest.Mocked<TaskAdapter>;
  let mockOccurrenceAdapter: jest.Mocked<OccurrenceAdapter>;
  let mockEventAdapter: jest.Mocked<CalendarEventAdapter>;

  beforeEach(() => {
    service = new TaskManagementService();
    mockTaskAdapter = (service as any).taskAdapter as jest.Mocked<TaskAdapter>;
    mockOccurrenceAdapter = (service as any).occurrenceAdapter as jest.Mocked<OccurrenceAdapter>;
    mockEventAdapter = (service as any).eventAdapter as jest.Mocked<CalendarEventAdapter>;
    jest.clearAllMocks();
    // Ensure any adapter methods used by tests exist
    mockTaskAdapter.createTask = mockTaskAdapter.createTask ?? jest.fn();
  });

  describe('createTask validations', () => {
    it('throws for fixed task without target/limit dates', async () => {
        const badInput: CreateTaskDTO = { ...makeCreateTaskDTO({ name: 'Bad Fixed' }), isFixed: true };

      try {
        await service.createTask('user-1', badInput);
        // If it doesn't throw, fail the test
        throw new Error('createTask did not throw as expected');
      } catch (err: any) {
        expect(err.message).toMatch(/Fixed tasks must have targetDate/);
      }
    });

    it('applies default recurrence when none provided', async () => {
      mockTaskAdapter.createTask.mockResolvedValue({ id: 1, recurrence: { id: 999, maxOccurrences: 1 } } as any);
      const input: CreateTaskDTO = makeCreateTaskDTO({ name: 'Single Task' });
      const result = await service.createTask('user-1', input);
      expect(mockTaskAdapter.createTask).toHaveBeenCalledWith('user-1', expect.objectContaining({ recurrence: expect.any(Object) }));
      expect(result).toBeDefined();
    });

    it('throws for mixed recurrence pattern (daysOfWeek + daysOfMonth)', async () => {
      const mixedInput: CreateTaskDTO = {
        name: 'Mixed pattern',
        recurrence: {
          maxOccurrences: 10,
          daysOfWeek: ['Mon', 'Wed'],
          daysOfMonth: [1, 15],
        },
      };

      await expect(service.createTask('user-1', mixedInput)).rejects.toThrow(/must use only ONE/);
    });

    it('throws for fixed repetitive task without endDate', async () => {
      const badFixedRep: CreateTaskDTO = {
        name: 'Fixed Rep',
        isFixed: true,
        targetDate: new Date('2025-12-01'),
        limitDate: new Date('2025-12-01T23:59:59Z'),
        recurrence: {
          daysOfWeek: ['Mon'],
        },
      };

      await expect(service.createTask('user-1', badFixedRep)).rejects.toThrow(/must have an endDate/);
    });
  });

  describe('getTask operations', () => {
    it('getTaskWithDetails returns task with nextOccurrence', async () => {
      const task = makeTaskWithRecurrence({ id: 5, taskType: 'Única' });
      const nextOcc = makeTaskOccurrence({ id: 50, associatedTaskId: 5 });

      mockTaskAdapter.getTaskWithRecurrence.mockResolvedValue(task as any);
      mockTaskAdapter.getNextOccurrence.mockResolvedValue(nextOcc);

      const result = await service.getTaskWithDetails(5);
      expect(result).toEqual({ ...task, nextOccurrence: nextOcc });
    });

    it('getUserTasks fetches active tasks for a user', async () => {
      const tasks = [makeTaskWithRecurrence({ id: 10, taskType: 'Única' }), makeTaskWithRecurrence({ id: 11, taskType: 'Única' })];
      mockTaskAdapter.getTasksWithRecurrenceByOwnerId.mockResolvedValue(tasks as any);

      const result = await service.getUserTasks('user-2');
      expect(result).toEqual(tasks);
      expect(mockTaskAdapter.getTasksWithRecurrenceByOwnerId).toHaveBeenCalledWith('user-2');
    });
  });

  describe('updateTask', () => {
    it('updates task properties via adapter', async () => {
      const updates = { name: 'Updated name', importance: 10 };
      const updatedTask = makeTaskWithRecurrence({ id: 3, name: 'Updated name', importance: 10 });
      mockTaskAdapter.updateTask.mockResolvedValue(updatedTask);

      const result = await service.updateTask(3, updates);
      expect(result).toEqual(updatedTask);
      expect(mockTaskAdapter.updateTask).toHaveBeenCalledWith(3, updates);
    });
  });

  describe('deleteTask', () => {
    it('skips pending occurrences and deletes associated events then soft-deletes task', async () => {
      const mockOccurrences: TaskOccurrence[] = [
        makeTaskOccurrence({ id: 100, associatedTaskId: 1, status: 'Pending' }),
        makeTaskOccurrence({ id: 101, associatedTaskId: 1, status: 'Completed' }),
        makeTaskOccurrence({ id: 102, associatedTaskId: 1, status: 'In Progress' }),
      ];

      mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(mockOccurrences);
      mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue([{ id: 5 } as CalendarEvent]);
      mockTaskAdapter.deleteTask.mockResolvedValue(undefined);

      const res = await service.deleteTask(1);

      // deleteEvent should be called once for the associated event
      expect(mockEventAdapter.deleteEvent).toHaveBeenCalled();

      // skipOccurrence called for pending and in progress occurrences
      expect(mockOccurrenceAdapter.skipOccurrence).toHaveBeenCalledWith(100);
      expect(mockOccurrenceAdapter.skipOccurrence).toHaveBeenCalledWith(102);

      // taskAdapter.deleteTask should be called to soft delete
      expect(mockTaskAdapter.deleteTask).toHaveBeenCalledWith(1);
    });
  });
});

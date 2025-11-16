import '../mocks';
import { TaskLifecycleService } from '../../core/task-lifecycle.service';
import { TaskManagementService } from '../../tasks/task-management.service';
import type { CreateTaskDTO } from '~/types';

describe('TaskLifecycleService (skeleton)', () => {
  let service: TaskLifecycleService;
  let mockTaskManagement: jest.Mocked<TaskManagementService>;

  beforeEach(() => {
    service = new TaskLifecycleService();
    // Cast inner components as mocked for easier assertions
    mockTaskManagement = (service as any).taskManagement as jest.Mocked<TaskManagementService>;
    jest.clearAllMocks();
  });

  it('should instantiate and expose methods used by routers', () => {
    // Ensure methods exist - detailed tests should mock adapters and test flows
    expect(typeof service.createTask).toBe('function');
    expect(typeof service.deleteTask).toBe('function');
  });

  it('createTask throws if fixed without dates', async () => {
    const input: CreateTaskDTO = { name: 'fixed', isFixed: true } as any;
    await expect(service.createTask('u1', input)).rejects.toThrow("Fixed tasks must have both targetDate");
  });

  it('createTask delegates to scheduler for non-fixed tasks', async () => {
    const createDto: CreateTaskDTO = { name: 'task', isFixed: false };

    mockTaskManagement.createTask = jest.fn().mockResolvedValue({ id: 50 });

    const createNextSpy = jest.spyOn(require('../../scheduling/task-scheduler.service').TaskSchedulerService.prototype, 'createNextOccurrence').mockResolvedValue(undefined as any);

    const result = await service.createTask('u1', createDto);
    expect(mockTaskManagement.createTask).toHaveBeenCalled();
    expect(createNextSpy).toHaveBeenCalledWith(50, expect.any(Object));

    createNextSpy.mockRestore();
  });

  it('createTask calls scheduler.createFixedTaskEvents for fixed tasks', async () => {
    const start = new Date();
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const dto: CreateTaskDTO = { name: 'fixed-task', isFixed: true, targetDate: start, limitDate: end } as any;

    mockTaskManagement.createTask = jest.fn().mockResolvedValue({ id: 60 });
    const fixedSpy = jest.spyOn(require('../../scheduling/task-scheduler.service').TaskSchedulerService.prototype, 'createFixedTaskEvents').mockResolvedValue(undefined as any);

    await service.createTask('u1', dto);
    expect(mockTaskManagement.createTask).toHaveBeenCalled();
    expect(fixedSpy).toHaveBeenCalled();

    fixedSpy.mockRestore();
  });

  it('deleteTask delegates to taskManagement and completeOccurrence delegates to occurrenceCompletion', async () => {
    mockTaskManagement.deleteTask = jest.fn().mockResolvedValue(undefined);

    const occSpy = jest.spyOn(require('../../occurrences/occurrence-completion.service').OccurrenceCompletionService.prototype, 'completeOccurrence').mockResolvedValue(undefined as any);

    await service.deleteTask(10);
    await service.completeOccurrence(13);

    expect(mockTaskManagement.deleteTask).toHaveBeenCalledWith(10);
    expect(occSpy).toHaveBeenCalledWith(13, undefined, undefined);
    occSpy.mockRestore();
  });

  // Tests cover creation flows, scheduler delegation, deletion and occurrence completion delegation
});

import '../mocks';
import { OccurrenceManagementService } from '../../occurrences/occurrence-management.service';
import { OccurrenceAdapter, CalendarEventAdapter } from '../../../adapter';
import type { TaskOccurrence, OccurrenceWithTask, CalendarEvent, CreateOccurrenceDTO, UpdateOccurrenceDTO } from '~/types';

/**
 * Tests for OccurrenceManagementService.
 * Covers CRUD operations, date-range queries, and analytics enrichment.
 */

describe('OccurrenceManagementService', () => {
  let service: OccurrenceManagementService;
  let mockOccurrenceAdapter: jest.Mocked<OccurrenceAdapter>;
  let mockEventAdapter: jest.Mocked<CalendarEventAdapter>;
  let mockAnalyticsService: jest.Mocked<any>;

  beforeEach(() => {
    service = new OccurrenceManagementService();
    mockOccurrenceAdapter = (service as any).occurrenceAdapter as jest.Mocked<OccurrenceAdapter>;
    mockEventAdapter = (service as any).eventAdapter as jest.Mocked<CalendarEventAdapter>;
    mockAnalyticsService = (service as any).analyticsService as jest.Mocked<any>;
    jest.clearAllMocks();
  });

  it('gets occurrences by date range and returns enriched task types (mocked)', async () => {
    const sampleOcc: OccurrenceWithTask = {
      id: 1,
      associatedTaskId: 10,
      startDate: new Date('2025-01-15'),
      limitDate: new Date('2025-01-20'),
      targetDate: null,
      targetTimeConsumption: 60,
      timeConsumed: 0,
      status: 'Pending',
      urgency: 5,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      task: {
        id: 10,
        ownerId: 'user-1',
        name: 'Task A',
        description: null,
        recurrenceId: 1,
        importance: 3,
        isActive: true,
        isFixed: false,
        fixedStartTime: null,
        fixedEndTime: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockOccurrenceAdapter.getOccurrencesByDateRange.mockResolvedValue([sampleOcc]);
    const res = await service.getOccurrencesByDateRange(new Date('2025-01-01'), new Date('2025-02-01'));
    expect(res).toEqual([sampleOcc]);
    expect(mockOccurrenceAdapter.getOccurrencesByDateRange).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), undefined);
  });

  it('getOccurrenceWithTask returns undefined for missing occurrence', async () => {
    mockOccurrenceAdapter.getOccurrenceWithTask.mockResolvedValue(undefined);
    const occ = await service.getOccurrenceWithTask(123);
    expect(occ).toBeUndefined();
  });

  it('createOccurrence delegates to adapter', async () => {
    const dto: CreateOccurrenceDTO = {
      associatedTaskId: 5,
      startDate: new Date('2025-11-20'),
      limitDate: new Date('2025-11-25'),
      targetTimeConsumption: 120,
    };

    const created: TaskOccurrence = {
      id: 1,
      associatedTaskId: dto.associatedTaskId,
      startDate: dto.startDate,
      limitDate: dto.limitDate ?? null,
      targetDate: dto.targetDate ?? null,
      targetTimeConsumption: dto.targetTimeConsumption ?? null,
      timeConsumed: 0,
      status: 'Pending',
      urgency: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOccurrenceAdapter.createOccurrence.mockResolvedValue(created);
    const result = await service.createOccurrence(dto);
    expect(result).toEqual(created);
    expect(mockOccurrenceAdapter.createOccurrence).toHaveBeenCalledWith(dto);
  });

  it('updateOccurrence updates fields via adapter', async () => {
    const updateDto: UpdateOccurrenceDTO = {
      status: 'In Progress',
      timeConsumed: 30,
    };

    const updated: TaskOccurrence = {
      id: 101,
      associatedTaskId: 5,
      startDate: new Date(),
      limitDate: null,
      targetDate: null,
      targetTimeConsumption: null,
      timeConsumed: 30,
      status: 'In Progress',
      urgency: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOccurrenceAdapter.updateOccurrence.mockResolvedValue(updated);
    const result = await service.updateOccurrence(101, updateDto);
    expect(result).toEqual(updated);
    expect(mockOccurrenceAdapter.updateOccurrence).toHaveBeenCalledWith(101, updateDto);
  });

  it('getTaskOccurrences fetches all occurrences for a task', async () => {
    const occs: TaskOccurrence[] = [
      {
        id: 50,
        associatedTaskId: 7,
        startDate: new Date('2025-11-01'),
        limitDate: null,
        targetDate: null,
        targetTimeConsumption: null,
        timeConsumed: null,
        status: 'Completed',
        urgency: null,
        completedAt: new Date('2025-11-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 51,
        associatedTaskId: 7,
        startDate: new Date('2025-11-08'),
        limitDate: null,
        targetDate: null,
        targetTimeConsumption: null,
        timeConsumed: null,
        status: 'Pending',
        urgency: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(occs);
    const result = await service.getTaskOccurrences(7);
    expect(result).toEqual(occs);
    expect(result.length).toBe(2);
  });

  it('getUserOccurrencesWithTask enriches occurrences with urgency', async () => {
    const baseOcc: OccurrenceWithTask = {
      id: 300,
      associatedTaskId: 20,
      startDate: new Date(),
      limitDate: null,
      targetDate: null,
      targetTimeConsumption: null,
      timeConsumed: null,
      status: 'Pending',
      urgency: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      task: {
        id: 20,
        ownerId: 'user-x',
        name: 'Sample',
        description: null,
        recurrenceId: null,
        importance: 5,
        isActive: true,
        isFixed: false,
        fixedStartTime: null,
        fixedEndTime: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const enriched = { ...baseOcc, urgency: 8 };

    mockOccurrenceAdapter.getOccurrencesWithTaskByUserId.mockResolvedValue([baseOcc]);
    mockAnalyticsService.enrichOccurrenceWithUrgency = jest.fn().mockReturnValue(enriched);

    const result = await service.getUserOccurrencesWithTask('user-x');
    expect(result).toEqual([enriched]);
    expect(mockAnalyticsService.enrichOccurrenceWithUrgency).toHaveBeenCalledWith(baseOcc);
  });

  it('getOccurrenceEvents fetches events for an occurrence', async () => {
    const events: CalendarEvent[] = [
      {
        id: 400,
        context: 'event-ctx',
        ownerId: 'u1',
        associatedOccurrenceId: 88,
        isFixed: false,
        start: new Date('2025-11-16T10:00:00Z'),
        finish: new Date('2025-11-16T11:00:00Z'),
        isCompleted: false,
        dedicatedTime: 60,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockEventAdapter.getEventsByOccurrenceId.mockResolvedValue(events);
    const result = await service.getOccurrenceEvents(88);
    expect(result).toEqual(events);
    expect(mockEventAdapter.getEventsByOccurrenceId).toHaveBeenCalledWith(88);
  });
});

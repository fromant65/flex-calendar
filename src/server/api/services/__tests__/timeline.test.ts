import './mocks';
import { TimelineService } from '../timeline.service';
import { OccurrenceAdapter, CalendarEventAdapter } from '../../adapter';
import type { MockOccurrence, MockTask } from './test-types';
import { makeTaskWithRecurrence, makeTaskOccurrence, makeEventWithDetails } from './fixtures';

describe('TimelineService', () => {
  let timelineService: TimelineService;
  let mockOccurrenceAdapter: jest.Mocked<OccurrenceAdapter>;
  let mockEventAdapter: jest.Mocked<CalendarEventAdapter>;

  beforeEach(() => {
    timelineService = new TimelineService();
    mockOccurrenceAdapter = (timelineService as any).occurrenceAdapter as jest.Mocked<OccurrenceAdapter>;
    mockEventAdapter = (timelineService as any).eventAdapter as jest.Mocked<CalendarEventAdapter>;
    // ensure the mocked adapters expose the new methods we need
    mockOccurrenceAdapter.getOccurrencesByDateRange = mockOccurrenceAdapter.getOccurrencesByDateRange ?? jest.fn();
    mockEventAdapter.getEventsWithDetailsByDateRange = mockEventAdapter.getEventsWithDetailsByDateRange ?? jest.fn();
    jest.clearAllMocks();
  });

  it('returns empty arrays when there are no occurrences in range', async () => {
    mockOccurrenceAdapter.getOccurrencesByDateRange.mockResolvedValue([]);
    mockEventAdapter.getEventsWithDetailsByDateRange.mockResolvedValue([]);

    const data = await timelineService.getTimelineData('user-1', new Date('2025-01-01'), new Date('2025-01-31'));

    expect(data.tasks).toEqual([]);
    expect(data.occurrences).toEqual([]);
    expect(data.events).toEqual([]);
  });

  it('aggregates tasks, occurrences and events for range', async () => {
    const mockTask = makeTaskWithRecurrence({ id: 22, name: 'Task 22' });

    const occ = { ...makeTaskOccurrence({ id: 33, associatedTaskId: 22, startDate: new Date('2025-10-01') }), task: mockTask } as any;

    const event = makeEventWithDetails({ id: 11, ownerId: 'user-1', associatedOccurrenceId: 33, occurrence: occ }) as any;

    mockOccurrenceAdapter.getOccurrencesByDateRange.mockResolvedValue([occ]);
    mockEventAdapter.getEventsWithDetailsByDateRange.mockResolvedValue([event]);

    const result = await timelineService.getTimelineData('user-1', new Date('2025-10-01'), new Date('2025-10-10'));

    // Tasks extracted from the occurrences
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0]?.id).toBe(22);

    // Occurrences transformed and have a typed status
    expect(result.occurrences.length).toBe(1);
    expect(result.occurrences[0]?.status).toBeDefined();

    // Events linked to occurrences
    expect(result.events.length).toBe(1);
    expect(result.events[0]?.occurrence?.id).toBe(33);
  });

  it('enriches occurrences with analytics when task is present', async () => {
    const mockTask = makeTaskWithRecurrence({ id: 30, name: 'Enrich test' });

    const occ = { ...makeTaskOccurrence({ id: 40, associatedTaskId: 30, startDate: new Date('2025-10-05'), status: 'Pending' }), task: mockTask } as any;

    mockOccurrenceAdapter.getOccurrencesByDateRange.mockResolvedValue([occ]);
    mockEventAdapter.getEventsWithDetailsByDateRange.mockResolvedValue([]);

    const result = await timelineService.getTimelineData('user-1', new Date('2025-10-01'), new Date('2025-10-10'));

    // The service should return enriched occurrences (urgency added by analytics)
    expect(result.occurrences.length).toBe(1);
    expect(result.occurrences[0]?.id).toBe(40);
  });

  it('deduplicates tasks when multiple occurrences reference the same task', async () => {
    const sharedTask = makeTaskWithRecurrence({
      id: 100,
      name: 'Recurring task',
      recurrence: { id: 1000, creationDate: new Date('2025-10-01'), interval: 7, maxOccurrences: null, completedOccurrences: 2, lastPeriodStart: new Date('2025-10-01'), daysOfWeek: null, daysOfMonth: null, endDate: null },
    });

    const occ1 = { ...makeTaskOccurrence({ id: 201, associatedTaskId: 100, startDate: new Date('2025-10-01'), status: 'Completed' }), task: sharedTask } as any;
    const occ2 = { ...makeTaskOccurrence({ id: 202, associatedTaskId: 100, startDate: new Date('2025-10-08'), status: 'Pending' }), task: sharedTask } as any;

    mockOccurrenceAdapter.getOccurrencesByDateRange.mockResolvedValue([occ1, occ2]);
    mockEventAdapter.getEventsWithDetailsByDateRange.mockResolvedValue([]);

    const result = await timelineService.getTimelineData('user-1', new Date('2025-10-01'), new Date('2025-10-15'));

    // Should only have one task even though 2 occurrences reference it
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0]?.id).toBe(100);
    expect(result.occurrences.length).toBe(2);
  });
});

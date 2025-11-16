import '../mocks';
import { BacklogDetectionService } from '../../occurrences/backlog-detection.service';
import { OccurrenceAdapter } from '../../../adapter';
import type { TaskWithRecurrence, TaskOccurrence } from '~/types';
import { makeTaskWithRecurrence, makeTaskOccurrence } from '../fixtures';

describe('BacklogDetectionService (skeleton)', () => {
  let service: BacklogDetectionService;
  let mockOccurrenceAdapter: jest.Mocked<OccurrenceAdapter>;

  beforeEach(() => {
    service = new BacklogDetectionService();
    mockOccurrenceAdapter = (service as any).occurrenceAdapter as jest.Mocked<OccurrenceAdapter>;
    jest.clearAllMocks();
  });

  it('detectBacklog returns default empty info when task has no recurrence', async () => {
    // The service returns an object with counters when no recurrence is present
    (service as any).taskAdapter.getTaskWithRecurrence.mockResolvedValue(undefined);
    const result = await service.detectBacklog(1);

    expect(result).toEqual({
      hasSevereBacklog: false,
      pendingCount: 0,
      oldestPendingDate: null,
      estimatedBacklogCount: 0,
      pendingOccurrences: [],
      overdueCount: 0,
      estimatedMissingCount: 0,
    });
  });

  it('detectBacklog identifies overdue occurrences and marks severe backlog', async () => {
    // Prepare a task with recurrence and a pending overdue occurrence
    (service as any).taskAdapter.getTaskWithRecurrence.mockResolvedValue(makeTaskWithRecurrence({ id: 1, recurrence: { id: 999, interval: 1, lastPeriodStart: new Date(), maxOccurrences: null, endDate: null, completedOccurrences: 0, daysOfWeek: null, daysOfMonth: null } as any }));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Provide a single pending occurrence with limitDate in the past
    const occurrences: TaskOccurrence[] = [makeTaskOccurrence({ id: 1, startDate: yesterday, limitDate: new Date(yesterday.getTime() - 24 * 3600 * 1000), status: 'Pending' })];

    mockOccurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue(occurrences);

    // Strategy indicates we should generate occurrences, but none are missing
    const mockStrategyFactory = { getStrategy: () => ({ shouldGenerateBacklogOccurrences: () => false }) };
    service = new BacklogDetectionService(mockStrategyFactory as any);

    // Replace the adapters with the mocks from the first service instance
    // Inject the same mocked adapters into the new service instance
    (service as any).occurrenceAdapter = { getOccurrencesByTaskId: jest.fn().mockResolvedValue(occurrences) } as any;
    (service as any).taskAdapter = { getTaskWithRecurrence: jest.fn().mockResolvedValue({ id: 1, recurrence: { type: 'daily' } }) } as any;

    const result = await service.detectBacklog(1);

    expect(result.overdueCount).toBeGreaterThan(0);
    expect(result.hasSevereBacklog).toBe(true);
  });

  // Additional backlog cases are tested: expired/pending/estimated-missing
  it('detectBacklog estimates missing occurrences for recurring habit tasks', async () => {
    // Task with recurrence
    (service as any).taskAdapter.getTaskWithRecurrence.mockResolvedValue(makeTaskWithRecurrence({ id: 2, recurrence: { id: 1000, interval: 1, lastPeriodStart: new Date(), maxOccurrences: null, endDate: null, completedOccurrences: 0, daysOfWeek: null, daysOfMonth: null } as any }));

    // Provide sorted occurrences with the last one 2 days ago
    const lastOccurrence = new Date();
    lastOccurrence.setDate(lastOccurrence.getDate() - 2);

    (service as any).occurrenceAdapter.getOccurrencesByTaskId.mockResolvedValue([
      makeTaskOccurrence({ id: 1, startDate: lastOccurrence, status: 'Completed' }),
    ]);

    // Ensure strategy indicates generation and next occurrence calculation yields one missing occurrence
    const mockStrategyFactory = { getStrategy: () => ({ shouldGenerateBacklogOccurrences: () => true }) };
    service = new BacklogDetectionService(mockStrategyFactory as any);

    // Inject the same mocks
    (service as any).occurrenceAdapter = { getOccurrencesByTaskId: jest.fn().mockResolvedValue([{ id: 1, startDate: lastOccurrence, status: 'Completed' }]) } as any;
    (service as any).taskAdapter = { getTaskWithRecurrence: jest.fn().mockResolvedValue({ id: 2, recurrence: { type: 'daily' } }) } as any;

    // DateCalculator: first call returns next day (1 day after last), second call returns a date after now
    const mockDateCalc = { calculateNextOccurrenceDate: jest.fn() };
    mockDateCalc.calculateNextOccurrenceDate
      .mockImplementationOnce((date: Date) => {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        return next;
      })
      .mockImplementationOnce(() => {
        const next = new Date();
        next.setDate(next.getDate() + 1);
        return next;
      });

    (service as any).dateCalculator = mockDateCalc;

    const result = await service.detectBacklog(2);
    expect(result.estimatedMissingCount).toBeGreaterThanOrEqual(1);
    expect(result.hasSevereBacklog).toBe(true);
  });
});

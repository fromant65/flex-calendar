/**
 * Tests for Habit+ Counter Increment Logic
 * Verifies that completedOccurrences is incremented correctly based on occurrence date
 */

import '../mocks';
import { TaskSchedulerService } from '../../scheduling/task-scheduler.service';
import type { MockTask } from '../test-types';

describe('Habit+ Counter Increment Logic', () => {
  let schedulerService: TaskSchedulerService;
  let mockRecurrenceRepo: {
    findById: jest.Mock;
    updateById: jest.Mock;
  };

  beforeEach(() => {
    schedulerService = new TaskSchedulerService();
    
    mockRecurrenceRepo = (schedulerService as unknown as { recurrenceRepo: typeof mockRecurrenceRepo }).recurrenceRepo;
    
    jest.clearAllMocks();
  });

  it('should increment counter when occurrence is in current period', async () => {
    const periodStart = new Date('2024-10-21T00:00:00.000Z');
    const occurrenceDate = new Date('2024-10-23T00:00:00.000Z'); // Within period
    const interval = 7;

    const recurrence: MockTask['recurrence'] = {
      id: 1,
      interval,
      maxOccurrences: 3,
      completedOccurrences: 1,
      lastPeriodStart: periodStart,
      daysOfWeek: null,
      daysOfMonth: null,
      endDate: null,
    };

    mockRecurrenceRepo.findById.mockResolvedValue(recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);

    // Act
    await schedulerService.incrementCompletedOccurrences(1, occurrenceDate);

    // Assert
    expect(mockRecurrenceRepo.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedOccurrences: 2, // Incremented
      })
    );
  });

  it('should NOT increment counter when occurrence is from previous period', async () => {
    const currentPeriodStart = new Date('2024-10-28T00:00:00.000Z');
    const occurrenceDate = new Date('2024-10-23T00:00:00.000Z'); // Before current period
    const interval = 7;

    const recurrence: MockTask['recurrence'] = {
      id: 1,
      interval,
      maxOccurrences: 3,
      completedOccurrences: 1,
      lastPeriodStart: currentPeriodStart,
      daysOfWeek: null,
      daysOfMonth: null,
      endDate: null,
    };

    mockRecurrenceRepo.findById.mockResolvedValue(recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);

    // Act
    await schedulerService.incrementCompletedOccurrences(1, occurrenceDate);

    // Assert - Should NOT call updateById at all (occurrence is from past period)
    expect(mockRecurrenceRepo.updateById).not.toHaveBeenCalled();
  });

  it('should increment counter when occurrence is exactly at period start', async () => {
    const periodStart = new Date('2024-10-21T00:00:00.000Z');
    const occurrenceDate = new Date('2024-10-21T00:00:00.000Z'); // Exactly at start
    const interval = 7;

    const recurrence: MockTask['recurrence'] = {
      id: 1,
      interval,
      maxOccurrences: 3,
      completedOccurrences: 0,
      lastPeriodStart: periodStart,
      daysOfWeek: null,
      daysOfMonth: null,
      endDate: null,
    };

    mockRecurrenceRepo.findById.mockResolvedValue(recurrence);
    mockRecurrenceRepo.updateById.mockResolvedValue(undefined);

    // Act
    await schedulerService.incrementCompletedOccurrences(1, occurrenceDate);

    // Assert
    expect(mockRecurrenceRepo.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        completedOccurrences: 1, // Incremented
      })
    );
  });
});

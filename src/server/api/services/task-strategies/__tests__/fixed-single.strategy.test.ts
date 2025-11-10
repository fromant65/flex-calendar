/**
 * Tests for FixedSingleStrategy
 * 
 * Verifies behavior of fixed single tasks (Fija Única)
 */

import { FixedSingleStrategy } from '../implementations/fixed-single.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, EventContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence, CalendarEvent } from '../../types';

describe('FixedSingleStrategy', () => {
  let strategy: FixedSingleStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: jest.Mocked<Pick<StrategyDependencies['scheduler'], 'incrementCompletedOccurrences'>>;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler as unknown as StrategyDependencies['scheduler'],
    };

    strategy = new FixedSingleStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.FIXED_SINGLE);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should deactivate task when occurrence is completed', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Completed' } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 1 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalledWith(
        1,
        context.occurrence.startDate
      );
      expect(action).toEqual({ type: 'DEACTIVATE_TASK' });
    });

    it('should deactivate task even without recurrence', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date() } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: null,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'DEACTIVATE_TASK' });
    });
  });

  describe('onOccurrenceSkipped', () => {
    it('should deactivate task when occurrence is skipped', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Skipped' } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 1 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalled();
      expect(action).toEqual({ type: 'DEACTIVATE_TASK' });
    });
  });

  describe('onEventCompleted', () => {
    it('should return NO_ACTION (service handles occurrence completion)', async () => {
      const context: EventContext = {
        event: { id: 1, associatedOccurrenceId: 1 } as CalendarEvent,
        occurrence: { id: 1 } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1 } as TaskRecurrence,
      };

      const action = await strategy.onEventCompleted(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
    });
  });

  describe('onEventSkipped', () => {
    it('should return NO_ACTION (service handles occurrence skipping)', async () => {
      const context: EventContext = {
        event: { id: 1, associatedOccurrenceId: 1 } as CalendarEvent,
        occurrence: { id: 1 } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1 } as TaskRecurrence,
      };

      const action = await strategy.onEventSkipped(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
    });
  });

  describe('shouldCreateNextOccurrence', () => {
    it('should never create next occurrence (pre-generated)', () => {
      expect(strategy.shouldCreateNextOccurrence()).toBe(false);
    });
  });

  describe('shouldGenerateBacklogOccurrences', () => {
    it('should not generate backlog occurrences', () => {
      expect(strategy.shouldGenerateBacklogOccurrences()).toBe(false);
    });
  });
});

/**
 * Tests for FixedRepetitiveStrategy
 * 
 * Verifies behavior of fixed repetitive tasks (Fija Repetitiva)
 */

import { FixedRepetitiveStrategy } from '../implementations/fixed-repetitive.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, EventContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence, CalendarEvent } from '../../types';

describe('FixedRepetitiveStrategy', () => {
  let strategy: FixedRepetitiveStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: jest.Mocked<Pick<StrategyDependencies['scheduler'], 'incrementCompletedOccurrences'>>;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler as unknown as StrategyDependencies['scheduler'],
    };

    strategy = new FixedRepetitiveStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.FIXED_REPETITIVE);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should deactivate task when all occurrences are finished', async () => {
      // After completing the 4th, all will be finished
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Completed' } as TaskOccurrence,
        { id: 3, status: 'Skipped' } as TaskOccurrence,
        { id: 4, status: 'Completed' } as TaskOccurrence, // Simulating this was just completed
      ];

      const context: OccurrenceContext = {
        occurrence: { ...allOccurrences[3]!, startDate: new Date() } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 4 } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalled();
      expect(action).toEqual({ type: 'DEACTIVATE_TASK' });
    });

    it('should not deactivate task when occurrences remain', async () => {
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Pending' } as TaskOccurrence, // This one is being completed
        { id: 3, status: 'Pending' } as TaskOccurrence,
      ];

      const context: OccurrenceContext = {
        occurrence: { ...allOccurrences[1]!, startDate: new Date() } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 3 } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
    });

    it('should handle missing context gracefully', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1 } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: null,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
    });
  });

  describe('onOccurrenceSkipped', () => {
    it('should deactivate task when all occurrences are finished', async () => {
      // After skipping the 3rd, all will be finished
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Skipped' } as TaskOccurrence,
        { id: 3, status: 'Skipped' } as TaskOccurrence, // Simulating this was just skipped
      ];

      const context: OccurrenceContext = {
        occurrence: { ...allOccurrences[2]!, startDate: new Date() } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 3 } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalled();
      expect(action).toEqual({ type: 'DEACTIVATE_TASK' });
    });

    it('should not deactivate task when occurrences remain', async () => {
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Pending' } as TaskOccurrence, // This one is being skipped
        { id: 3, status: 'Pending' } as TaskOccurrence,
        { id: 4, status: 'Pending' } as TaskOccurrence,
      ];

      const context: OccurrenceContext = {
        occurrence: { ...allOccurrences[1]!, startDate: new Date() } as TaskOccurrence,
        task: { id: 1, isFixed: true } as Task,
        recurrence: { id: 1, maxOccurrences: 4 } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
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
    it('should never create next occurrence (all pre-generated)', () => {
      expect(strategy.shouldCreateNextOccurrence()).toBe(false);
    });
  });

  describe('shouldGenerateBacklogOccurrences', () => {
    it('should not generate backlog occurrences', () => {
      expect(strategy.shouldGenerateBacklogOccurrences()).toBe(false);
    });
  });
});

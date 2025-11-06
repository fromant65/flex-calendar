/**
 * Tests for FiniteRecurringStrategy
 * 
 * Verifies behavior of finite recurring tasks (Recurrente Finita)
 */

import { FiniteRecurringStrategy } from '../implementations/finite-recurring.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence } from '../../types';

describe('FiniteRecurringStrategy', () => {
  let strategy: FiniteRecurringStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: any;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler,
    };

    strategy = new FiniteRecurringStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.FINITE_RECURRING);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should create next occurrence when under maxOccurrences', async () => {
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed', targetTimeConsumption: 2 } as TaskOccurrence,
        { id: 2, status: 'Pending' } as TaskOccurrence,
      ];

      const context: OccurrenceContext = {
        occurrence: allOccurrences[1]!,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, maxOccurrences: 5, interval: null } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalledWith(
        1,
        allOccurrences[1]!.startDate
      );
      expect(action).toEqual({
        type: 'CREATE_NEXT_OCCURRENCE',
        params: {
          taskId: 1,
          targetTimeConsumption: undefined,
        },
      });
    });

    it('should complete task when maxOccurrences reached', async () => {
      // Simulating that we're completing the 5th occurrence
      // After this completion, there will be 5 discarded (4 completed + 1 about to be completed)
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Completed' } as TaskOccurrence,
        { id: 3, status: 'Skipped' } as TaskOccurrence,
        { id: 4, status: 'Completed' } as TaskOccurrence,
        { id: 5, status: 'Completed' } as TaskOccurrence, // Simulating this was just completed
      ];

      const context: OccurrenceContext = {
        occurrence: allOccurrences[4]!,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, maxOccurrences: 5, interval: null } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'COMPLETE_TASK' });
    });

    it('should handle missing context gracefully', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1 } as TaskOccurrence,
        task: { id: 1 } as Task,
        recurrence: null,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'NO_ACTION' });
    });
  });

  describe('onOccurrenceSkipped', () => {
    it('should create next occurrence when under maxOccurrences', async () => {
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Pending' } as TaskOccurrence,
      ];

      const context: OccurrenceContext = {
        occurrence: allOccurrences[1]!,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, maxOccurrences: 5, interval: null } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalled();
      expect(action).toEqual({
        type: 'CREATE_NEXT_OCCURRENCE',
        params: { taskId: 1 },
      });
    });

    it('should complete task when maxOccurrences reached after skip', async () => {
      // After this skip, all 5 occurrences will be discarded
      const allOccurrences: TaskOccurrence[] = [
        { id: 1, status: 'Completed' } as TaskOccurrence,
        { id: 2, status: 'Completed' } as TaskOccurrence,
        { id: 3, status: 'Skipped' } as TaskOccurrence,
        { id: 4, status: 'Skipped' } as TaskOccurrence,
        { id: 5, status: 'Skipped' } as TaskOccurrence, // Simulating this was just skipped
      ];

      const context: OccurrenceContext = {
        occurrence: allOccurrences[4]!,
        task: { id: 1 } as Task,
        recurrence: { id: 1, maxOccurrences: 5 } as TaskRecurrence,
        allOccurrences,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(action).toEqual({ type: 'COMPLETE_TASK' });
    });
  });

  describe('shouldGenerateBacklogOccurrences', () => {
    it('should not generate backlog occurrences', () => {
      expect(strategy.shouldGenerateBacklogOccurrences()).toBe(false);
    });
  });
});

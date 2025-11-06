/**
 * Tests for HabitStrategy
 * 
 * Verifies behavior of simple habit tasks (Hábito)
 */

import { HabitStrategy } from '../implementations/habit.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence } from '../../types';

describe('HabitStrategy', () => {
  let strategy: HabitStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: any;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler,
    };

    strategy = new HabitStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.HABIT);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should always create next occurrence', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Completed' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, interval: 7 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalledWith(
        1,
        context.occurrence.startDate
      );
      expect(action).toEqual({
        type: 'CREATE_NEXT_OCCURRENCE',
        params: { taskId: 1 },
      });
    });

    it('should handle missing recurrence gracefully', async () => {
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
    it('should create next occurrence even when skipped', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Skipped' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, interval: 7 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(mockScheduler.incrementCompletedOccurrences).toHaveBeenCalledWith(
        1,
        context.occurrence.startDate
      );
      expect(action).toEqual({
        type: 'CREATE_NEXT_OCCURRENCE',
        params: { taskId: 1 },
      });
    });
  });

  describe('shouldGenerateBacklogOccurrences', () => {
    it('should generate backlog occurrences', () => {
      expect(strategy.shouldGenerateBacklogOccurrences()).toBe(true);
    });
  });

  describe('shouldCompleteTask', () => {
    it('should never complete task automatically', () => {
      expect(strategy.shouldCompleteTask()).toBe(false);
    });
  });
});

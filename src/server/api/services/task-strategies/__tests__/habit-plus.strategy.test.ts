/**
 * Tests for HabitPlusStrategy
 * 
 * Verifies behavior of advanced habit tasks with periods (Hábito +)
 */

import { HabitPlusStrategy } from '../implementations/habit-plus.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence } from '../../types';

describe('HabitPlusStrategy', () => {
  let strategy: HabitPlusStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: jest.Mocked<Pick<StrategyDependencies['scheduler'], 'incrementCompletedOccurrences'>>;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler as unknown as StrategyDependencies['scheduler'],
    };

    strategy = new HabitPlusStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.HABIT_PLUS);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should always create next occurrence', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Completed' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: {
          id: 1,
          interval: 7,
          daysOfWeek: ['Mon', 'Wed', 'Fri'],
          maxOccurrences: 3,
        } as TaskRecurrence,
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

    it('should handle period transitions correctly', async () => {
      // The scheduler handles period transitions automatically
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Completed' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: {
          id: 1,
          interval: 30,
          daysOfMonth: [1, 15, 30],
          maxOccurrences: 3,
        } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({
        type: 'CREATE_NEXT_OCCURRENCE',
        params: { taskId: 1 },
      });
    });
  });

  describe('onOccurrenceSkipped', () => {
    it('should create next occurrence even when skipped', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, startDate: new Date(), status: 'Skipped' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: {
          id: 1,
          interval: 7,
          daysOfWeek: ['Mon', 'Wed', 'Fri'],
          maxOccurrences: 3,
        } as TaskRecurrence,
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

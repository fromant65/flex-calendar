/**
 * Tests for SingleTaskStrategy
 * 
 * Verifies behavior of single occurrence tasks (Tarea Única)
 */

import { SingleTaskStrategy } from '../implementations/single-task.strategy';
import { TaskType } from '../../types';
import type { OccurrenceContext, StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence, TaskOccurrence } from '../../types';

describe('SingleTaskStrategy', () => {
  let strategy: SingleTaskStrategy;
  let mockDependencies: StrategyDependencies;
  let mockScheduler: any;

  beforeEach(() => {
    mockScheduler = {
      incrementCompletedOccurrences: jest.fn().mockResolvedValue(undefined),
    };

    mockDependencies = {
      scheduler: mockScheduler,
    };

    strategy = new SingleTaskStrategy(mockDependencies);
  });

  describe('taskType', () => {
    it('should have correct task type', () => {
      expect(strategy.taskType).toBe(TaskType.SINGLE);
    });
  });

  describe('onOccurrenceCompleted', () => {
    it('should complete task when occurrence is completed', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, status: 'Completed' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, maxOccurrences: 1 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceCompleted(context);

      expect(action).toEqual({ type: 'COMPLETE_TASK' });
    });
  });

  describe('onOccurrenceSkipped', () => {
    it('should complete task when occurrence is skipped', async () => {
      const context: OccurrenceContext = {
        occurrence: { id: 1, status: 'Skipped' } as TaskOccurrence,
        task: { id: 1, isFixed: false } as Task,
        recurrence: { id: 1, maxOccurrences: 1 } as TaskRecurrence,
      };

      const action = await strategy.onOccurrenceSkipped(context);

      expect(action).toEqual({ type: 'COMPLETE_TASK' });
    });
  });

  describe('shouldCreateNextOccurrence', () => {
    it('should never create next occurrence', () => {
      const shouldCreate = strategy.shouldCreateNextOccurrence();

      expect(shouldCreate).toBe(false);
    });
  });

  describe('shouldGenerateBacklogOccurrences', () => {
    it('should not generate backlog occurrences', () => {
      expect(strategy.shouldGenerateBacklogOccurrences()).toBe(false);
    });
  });
});

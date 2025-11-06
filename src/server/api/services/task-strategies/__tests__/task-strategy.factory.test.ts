/**
 * Tests for TaskStrategyFactory
 * 
 * Verifies that factory correctly instantiates and returns strategies
 * based on task type calculation.
 */

import { TaskStrategyFactory } from '../task-strategy.factory';
import { SingleTaskStrategy } from '../implementations/single-task.strategy';
import { FiniteRecurringStrategy } from '../implementations/finite-recurring.strategy';
import { HabitStrategy } from '../implementations/habit.strategy';
import { HabitPlusStrategy } from '../implementations/habit-plus.strategy';
import { FixedSingleStrategy } from '../implementations/fixed-single.strategy';
import { FixedRepetitiveStrategy } from '../implementations/fixed-repetitive.strategy';
import type { StrategyDependencies } from '../base/strategy-types';
import type { Task, TaskRecurrence } from '../../types';

describe('TaskStrategyFactory', () => {
  let factory: TaskStrategyFactory;
  let mockDependencies: StrategyDependencies;

  beforeEach(() => {
    // Mock dependencies
    mockDependencies = {
      scheduler: {
        incrementCompletedOccurrences: jest.fn(),
      } as any,
    };

    factory = new TaskStrategyFactory(mockDependencies);
  });

  describe('getStrategy', () => {
    it('should return SingleTaskStrategy for Tarea Única', () => {
      const task: Task = { isFixed: false } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(SingleTaskStrategy);
      expect(strategy.taskType).toBe('Única');
    });

    it('should return FiniteRecurringStrategy for Recurrente Finita', () => {
      const task: Task = { isFixed: false } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 5,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(FiniteRecurringStrategy);
      expect(strategy.taskType).toBe('Recurrente Finita');
    });

    it('should return HabitStrategy for Hábito', () => {
      const task: Task = { isFixed: false } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: null,
        interval: 7,
        daysOfWeek: null,
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(HabitStrategy);
      expect(strategy.taskType).toBe('Hábito');
    });

    it('should return HabitPlusStrategy for Hábito+ with daysOfWeek', () => {
      const task: Task = { isFixed: false } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 3,
        interval: 7,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(HabitPlusStrategy);
      expect(strategy.taskType).toBe('Hábito +');
    });

    it('should return HabitPlusStrategy for Hábito+ with daysOfMonth', () => {
      const task: Task = { isFixed: false } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 3,
        interval: 30,
        daysOfWeek: null,
        daysOfMonth: [1, 15, 28],
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(HabitPlusStrategy);
      expect(strategy.taskType).toBe('Hábito +');
    });

    it('should return FixedSingleStrategy for Fija Única', () => {
      const task: Task = { isFixed: true } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 1,
        interval: null,
        daysOfWeek: null,
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(FixedSingleStrategy);
      expect(strategy.taskType).toBe('Fija Única');
    });

    it('should return FixedRepetitiveStrategy for Fija Repetitiva', () => {
      const task: Task = { isFixed: true } as Task;
      const recurrence: TaskRecurrence = {
        id: 1,
        maxOccurrences: 5,
        interval: 7,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        daysOfMonth: null,
      } as TaskRecurrence;

      const strategy = factory.getStrategy(task, recurrence);
      
      expect(strategy).toBeInstanceOf(FixedRepetitiveStrategy);
      expect(strategy.taskType).toBe('Fija Repetitiva');
    });

    it('should throw error for unknown task type', () => {
      // This shouldn't happen in practice, but test error handling
      const task: any = { isFixed: false };
      const recurrence: any = null;

      expect(() => factory.getStrategy(task, recurrence)).not.toThrow();
      // Should return SingleTaskStrategy for null recurrence
    });
  });

  describe('getStrategyByType', () => {
    it('should return correct strategy by explicit type', () => {
      const strategy = factory.getStrategyByType('Hábito');
      
      expect(strategy).toBeInstanceOf(HabitStrategy);
      expect(strategy.taskType).toBe('Hábito');
    });

    it('should throw error for invalid task type', () => {
      expect(() => factory.getStrategyByType('Invalid' as any)).toThrow(
        'No strategy found for task type: Invalid'
      );
    });
  });

  describe('hasStrategy', () => {
    it('should return true for registered task types', () => {
      expect(factory.hasStrategy('Única')).toBe(true);
      expect(factory.hasStrategy('Recurrente Finita')).toBe(true);
      expect(factory.hasStrategy('Hábito')).toBe(true);
      expect(factory.hasStrategy('Hábito +')).toBe(true);
      expect(factory.hasStrategy('Fija Única')).toBe(true);
      expect(factory.hasStrategy('Fija Repetitiva')).toBe(true);
    });

    it('should return false for unregistered task types', () => {
      expect(factory.hasStrategy('Invalid' as any)).toBe(false);
    });
  });

  describe('getRegisteredTypes', () => {
    it('should return all 6 task types', () => {
      const types = factory.getRegisteredTypes();
      
      expect(types).toHaveLength(6);
      expect(types).toContain('Única');
      expect(types).toContain('Recurrente Finita');
      expect(types).toContain('Hábito');
      expect(types).toContain('Hábito +');
      expect(types).toContain('Fija Única');
      expect(types).toContain('Fija Repetitiva');
    });
  });
});

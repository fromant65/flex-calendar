/**
 * Task Strategies Module
 * 
 * Exports strategy pattern implementation for handling different task types.
 * Each task type (Única, Recurrente Finita, Hábito, Hábito+, Fija Única, Fija Repetitiva)
 * has its own strategy with encapsulated behavior.
 */

// Base interfaces and types 
export type { ITaskStrategy, TaskLifecycleAction } from './base/task-strategy.interface';
export type { 
  OccurrenceContext, 
  EventContext, 
  TaskContext, 
  TaskCompletionContext,
  StrategyDependencies 
} from './base/strategy-types';
export { AbstractTaskStrategy } from './base/abstract-task-strategy';

// Factory
export { TaskStrategyFactory } from './task-strategy.factory';

// Strategy implementations
export { SingleTaskStrategy } from './implementations/single-task.strategy';
export { FiniteRecurringStrategy } from './implementations/finite-recurring.strategy';
export { HabitStrategy } from './implementations/habit.strategy';
export { HabitPlusStrategy } from './implementations/habit-plus.strategy';
export { FixedSingleStrategy } from './implementations/fixed-single.strategy';
export { FixedRepetitiveStrategy } from './implementations/fixed-repetitive.strategy';

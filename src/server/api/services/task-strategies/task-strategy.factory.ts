/**
 * Task Strategy Factory
 * 
 * Central factory for creating and retrieving task type strategies.
 * Uses the Strategy pattern to eliminate conditional logic for task types.
 * 
 * Usage:
 *   const factory = new TaskStrategyFactory(dependencies);
 *   const strategy = factory.getStrategy(task, recurrence);
 *   const action = await strategy.onOccurrenceCompleted(context);
 */

import type { ITaskStrategy } from './base/task-strategy.interface';
import type { StrategyDependencies } from './base/strategy-types';
import type { Task, TaskRecurrence } from '../types';
import { TaskType } from '../types';
import { calculateTaskType } from './utils/calculate-task-type';

// Import strategy implementations
import { SingleTaskStrategy } from './implementations/single-task.strategy';
import { FiniteRecurringStrategy } from './implementations/finite-recurring.strategy';
import { HabitStrategy } from './implementations/habit.strategy';
import { HabitPlusStrategy } from './implementations/habit-plus.strategy';
import { FixedSingleStrategy } from './implementations/fixed-single.strategy';
import { FixedRepetitiveStrategy } from './implementations/fixed-repetitive.strategy';

export class TaskStrategyFactory {
  private strategies: Map<TaskType, ITaskStrategy>;

  constructor(dependencies: StrategyDependencies) {
    // Initialize all strategies with dependencies
    this.strategies = new Map<TaskType, ITaskStrategy>([
      [TaskType.SINGLE, new SingleTaskStrategy(dependencies)],
      [TaskType.FINITE_RECURRING, new FiniteRecurringStrategy(dependencies)],
      [TaskType.HABIT, new HabitStrategy(dependencies)],
      [TaskType.HABIT_PLUS, new HabitPlusStrategy(dependencies)],
      [TaskType.FIXED_SINGLE, new FixedSingleStrategy(dependencies)],
      [TaskType.FIXED_REPETITIVE, new FixedRepetitiveStrategy(dependencies)],
    ]);
  }

  /**
   * Get the appropriate strategy for a task
   * Determines task type using calculateTaskType helper
   * 
   * @param task - The task entity
   * @param recurrence - Optional recurrence (if not already in task)
   * @returns The strategy for this task type
   * @throws Error if no strategy found for task type
   */
  getStrategy(task: Task | { isFixed?: boolean }, recurrence?: TaskRecurrence | null): ITaskStrategy {
    const taskType = calculateTaskType(recurrence, task);
    const strategy = this.strategies.get(taskType);

    if (!strategy) {
      throw new Error(`No strategy found for task type: ${taskType}`);
    }

    return strategy;
  }

  /**
   * Get strategy by explicit task type
   * Useful for testing or when task type is already known
   * 
   * @param taskType - The task type
   * @returns The strategy for this task type
   * @throws Error if no strategy found for task type
   */
  getStrategyByType(taskType: TaskType): ITaskStrategy {
    const strategy = this.strategies.get(taskType);

    if (!strategy) {
      throw new Error(`No strategy found for task type: ${taskType}`);
    }

    return strategy;
  }

  /**
   * Check if a strategy exists for a task type
   * 
   * @param taskType - The task type to check
   * @returns True if strategy exists
   */
  hasStrategy(taskType: TaskType): boolean {
    return this.strategies.has(taskType);
  }

  /**
   * Get all registered task types
   * 
   * @returns Array of all registered task types
   */
  getRegisteredTypes(): TaskType[] {
    return Array.from(this.strategies.keys());
  }
}

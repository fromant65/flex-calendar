/**
 * Recurrence Adapter - connects service layer with repository layer for task recurrence
 */

import { TaskRecurrenceRepository } from "../repository";
import type { TaskRecurrence } from "../services/types";

export class RecurrenceAdapter {
  private recurrenceRepo: TaskRecurrenceRepository;

  constructor() {
    this.recurrenceRepo = new TaskRecurrenceRepository();
  }

  /**
   * Get recurrence by ID
   */
  async getRecurrenceById(recurrenceId: number): Promise<TaskRecurrence | undefined> {
    const recurrence = await this.recurrenceRepo.findById(recurrenceId);
    return recurrence ? (recurrence as TaskRecurrence) : undefined;
  }

  /**
   * Update recurrence
   */
  async updateRecurrence(recurrenceId: number, data: Partial<TaskRecurrence>): Promise<TaskRecurrence | undefined> {
    const result = await this.recurrenceRepo.updateById(recurrenceId, data);
    return result ? (result as TaskRecurrence) : undefined;
  }

  /**
   * Increment completed occurrences count
   */
  async incrementCompletedOccurrences(recurrenceId: number, amount: number = 1): Promise<TaskRecurrence | undefined> {
    const recurrence = await this.recurrenceRepo.findById(recurrenceId);
    if (!recurrence) return undefined;

    const newCount = (recurrence.completedOccurrences ?? 0) + amount;
    const result = await this.recurrenceRepo.updateById(recurrenceId, {
      completedOccurrences: newCount,
    });
    return result ? (result as TaskRecurrence) : undefined;
  }

  /**
   * Reset completed occurrences count for a new period
   */
  async resetCompletedOccurrences(recurrenceId: number): Promise<TaskRecurrence | undefined> {
    const result = await this.recurrenceRepo.updateById(recurrenceId, {
      completedOccurrences: 0,
    });
    return result ? (result as TaskRecurrence) : undefined;
  }
}

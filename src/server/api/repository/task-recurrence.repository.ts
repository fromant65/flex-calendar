/**
 * Task Recurrence Repository - handles database operations for task recurrences
 */

import type { TaskRecurrence } from "../services/types";

export class TaskRecurrenceRepository {
  async findById(_id: number): Promise<TaskRecurrence | undefined> {
    return undefined;
  }

  async updateById(
    _id: number,
    _data: Partial<TaskRecurrence>,
  ): Promise<TaskRecurrence | undefined> {
    return undefined;
  }
}

/**
 * Task Recurrence Repository - handles database operations for task recurrences
 */

import { taskRecurrences } from "~/server/db/schema";
import { BaseRepository } from "./base.repository";

export class TaskRecurrenceRepository extends BaseRepository<typeof taskRecurrences> {
  constructor() {
    super(taskRecurrences);
  }
}

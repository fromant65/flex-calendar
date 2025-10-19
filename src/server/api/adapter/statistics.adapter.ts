/**
 * Statistics Adapter - connects service layer with repository layer for statistics
 */

import { StatisticsRepository, TaskRepository } from "../repository";
import type { StatsDataset } from "../services/stats/stats-types";

export class StatisticsAdapter {
  private statsRepo: StatisticsRepository;
  private taskRepo: TaskRepository;

  constructor() {
    this.statsRepo = new StatisticsRepository();
    this.taskRepo = new TaskRepository();
  }

  /**
   * Fetch all necessary data for statistics calculation
   */
  async fetchUserDataset(userId: string): Promise<StatsDataset> {
    const [userTasks, joinedOccurrences, userEvents, recurrences] = await Promise.all([
      this.statsRepo.findUserTasks(userId),
      this.statsRepo.findUserTasksWithOccurrences(userId),
      this.statsRepo.findUserCalendarEvents(userId),
      this.statsRepo.findUserRecurrences(userId),
    ]);

    // Transform joined data - innerJoin returns { task_occurrence: {...}, tasks: {...} }
    const userOccurrences = joinedOccurrences.map((row) => row.task_occurrence);

    const recurrenceMap = new Map(recurrences.map((r) => [r.id, r]));

    return {
      tasks: userTasks,
      occurrences: userOccurrences,
      events: userEvents,
      recurrenceMap,
    };
  }

  /**
   * Get completed tasks for a user
   */
  async getCompletedTasks(userId: string) {
    return await this.statsRepo.findCompletedTasks(userId);
  }

  /**
   * Get habit tasks for a user
   */
  async getHabitTasks(userId: string) {
    return await this.statsRepo.findHabitTasks(userId);
  }

  /**
   * Get occurrences by task IDs
   */
  async getOccurrencesByTaskIds(taskIds: number[]) {
    return await this.statsRepo.findOccurrencesByTaskIds(taskIds);
  }

  /**
   * Get events in date range
   */
  async getEventsInRange(userId: string, startDate: Date, endDate: Date) {
    return await this.statsRepo.findEventsInRange(userId, startDate, endDate);
  }

  /**
   * Get occurrences by status
   */
  async getOccurrencesByStatus(userId: string, status: string) {
    return await this.statsRepo.findOccurrencesByStatus(userId, status);
  }
}

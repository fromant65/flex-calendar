/**
 * Statistics Adapter - connects service layer with repository layer for statistics
 */

import { StatisticsRepository, TaskRepository } from "../repository";
import type {
  StatsDataset,
  StatsOccurrence,
  StatsTask,
} from "../services/stats/stats-types";
import type { TaskOccurrenceStatus } from "../services/types";

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
    const [userTasks, joinedOccurrences, userEvents] = await Promise.all([
      this.statsRepo.findUserTasks(userId),
      this.statsRepo.findUserTasksWithOccurrences(userId),
      this.statsRepo.findUserCalendarEvents(userId),
    ]);

    // Transform joined data - innerJoin returns { task_occurrence: {...}, tasks: {...} }
    const userOccurrences: StatsOccurrence[] = joinedOccurrences.map((row) => ({
      id: row.task_occurrence.id,
      taskId: row.task_occurrence.taskId,
      status: row.task_occurrence.status,
      slotStartAt: row.task_occurrence.slotStartAt,
      slotEndAt: row.task_occurrence.slotEndAt,
      dueAt: row.task_occurrence.dueAt,
      tentativeAt: row.task_occurrence.tentativeAt,
      completedAt: row.task_occurrence.completedAt,
      createdAt: row.task_occurrence.createdAt,
      timeSpentMinutes: row.task_occurrence.timeSpentMinutes,
      targetTimeMinutes: row.task_occurrence.targetTimeMinutes,
    }));

    const normalizedTasks: StatsTask[] = userTasks.map((task) => ({
      id: task.id,
      name: task.name,
      ownerId: task.ownerId,
      importance: task.importance,
      isFixed: task.isFixed,
      status: task.status,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    }));

    return {
      tasks: normalizedTasks,
      occurrences: userOccurrences,
      events: userEvents,
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
  async getOccurrencesByStatus(userId: string, status: TaskOccurrenceStatus) {
    return await this.statsRepo.findOccurrencesByStatus(userId, status);
  }
}

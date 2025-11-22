/**
 * Admin Service - Business logic for admin operations and statistics
 */

import { AdminAdapter } from "../adapter";

export interface GlobalStatsInput {
  startDate: Date;
  endDate: Date;
}

export interface GlobalStatsOutput {
  totalTasksCreated: number;
  totalOccurrencesCreated: number;
  totalEventsCreated: number;
  totalOccurrencesCompleted: number;
  totalEventsCompleted: number;
  totalUsers: number;
  activeUsers: number;
}

export interface UserActivityInput {
  startDate: Date;
  endDate: Date;
}

export interface UserStatsOutput {
  userId: string;
  userName: string | null;
  userEmail: string;
  tasksCreated: number;
  occurrencesCompleted: number;
  eventsCompleted: number;
}

export interface UserDetailStatsInput {
  userId: string;
  startDate: Date;
  endDate: Date;
}

export class AdminService {
  private adapter: AdminAdapter;

  constructor(adapter?: AdminAdapter) {
    this.adapter = adapter ?? new AdminAdapter();
  }

  /**
   * Get global statistics across all users for a date range
   */
  async getGlobalStatistics(input: GlobalStatsInput): Promise<GlobalStatsOutput> {
    const stats = await this.adapter.getGlobalStats(input.startDate, input.endDate);

    return {
      totalTasksCreated: stats.tasksCreated.length,
      totalOccurrencesCreated: stats.occurrencesCreated.length,
      totalEventsCreated: stats.eventsCreated.length,
      totalOccurrencesCompleted: stats.completedOccurrences.length,
      totalEventsCompleted: stats.completedEvents.length,
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
    };
  }

  /**
   * Get statistics for all users with activity in the date range
   */
  async getUserActivityStatistics(input: UserActivityInput): Promise<UserStatsOutput[]> {
    const usersWithActivity = await this.adapter.getUsersWithActivity(
      input.startDate,
      input.endDate
    );

    // Get detailed stats for each user
    const userStatsPromises = usersWithActivity.map(async (user) => {
      const stats = await this.adapter.getUserStats(user.id, input.startDate, input.endDate);

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        tasksCreated: stats.tasksCreated.length,
        occurrencesCompleted: stats.completedOccurrences.length,
        eventsCompleted: stats.completedEvents.length,
      };
    });

    return await Promise.all(userStatsPromises);
  }

  /**
   * Get detailed statistics for a specific user
   */
  async getUserDetailStatistics(input: UserDetailStatsInput): Promise<UserStatsOutput> {
    const stats = await this.adapter.getUserStats(input.userId, input.startDate, input.endDate);

    // Get user info
    const allUsers = await this.adapter.getAllUsers();
    const user = allUsers.find((u) => u.id === input.userId);

    return {
      userId: input.userId,
      userName: user?.name ?? null,
      userEmail: user?.email ?? "unknown",
      tasksCreated: stats.tasksCreated.length,
      occurrencesCompleted: stats.completedOccurrences.length,
      eventsCompleted: stats.completedEvents.length,
    };
  }

  /**
   * Get user counts (total and active)
   */
  async getUserCounts() {
    return await this.adapter.getUserCounts();
  }

  /**
   * Get all users with their statistics
   */
  async getAllUsersWithStatistics() {
    return await this.adapter.getAllUsersWithStats();
  }
}

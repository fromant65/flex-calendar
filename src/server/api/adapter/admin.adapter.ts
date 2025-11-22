/**
 * Admin Adapter - connects service layer with repository layer for admin operations
 */

import { AdminRepository } from "../repository";

export class AdminAdapter {
  private adminRepo: AdminRepository;

  constructor() {
    this.adminRepo = new AdminRepository();
  }

  /**
   * Get global statistics for a date range
   */
  async getGlobalStats(startDate: Date, endDate: Date) {
    const [
      tasksCreated,
      occurrencesCreated,
      eventsCreated,
      completedOccurrences,
      completedEvents,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.adminRepo.getTasksCreatedInRange(startDate, endDate),
      this.adminRepo.getOccurrencesCreatedInRange(startDate, endDate),
      this.adminRepo.getEventsCreatedInRange(startDate, endDate),
      this.adminRepo.getCompletedOccurrencesInRange(startDate, endDate),
      this.adminRepo.getCompletedEventsInRange(startDate, endDate),
      this.adminRepo.getTotalUsersCount(),
      this.adminRepo.getActiveUsersCount(),
    ]);

    return {
      tasksCreated,
      occurrencesCreated,
      eventsCreated,
      completedOccurrences,
      completedEvents,
      totalUsers,
      activeUsers,
    };
  }

  /**
   * Get users with activity in a date range
   */
  async getUsersWithActivity(startDate: Date, endDate: Date) {
    return await this.adminRepo.getUsersWithActivityInRange(startDate, endDate);
  }

  /**
   * Get detailed statistics for a specific user
   */
  async getUserStats(userId: string, startDate: Date, endDate: Date) {
    const [tasksCreated, completedOccurrences, completedEvents] = await Promise.all([
      this.adminRepo.getUserTasksInRange(userId, startDate, endDate),
      this.adminRepo.getUserCompletedOccurrencesInRange(userId, startDate, endDate),
      this.adminRepo.getUserCompletedEventsInRange(userId, startDate, endDate),
    ]);

    return {
      tasksCreated,
      completedOccurrences,
      completedEvents,
    };
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return await this.adminRepo.getAllUsers();
  }

  /**
   * Get total and active user counts
   */
  async getUserCounts() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.adminRepo.getTotalUsersCount(),
      this.adminRepo.getActiveUsersCount(),
    ]);

    return {
      totalUsers,
      activeUsers,
    };
  }

  /**
   * Get all users with their statistics
   */
  async getAllUsersWithStats() {
    return await this.adminRepo.getAllUsersWithStats();
  }
}

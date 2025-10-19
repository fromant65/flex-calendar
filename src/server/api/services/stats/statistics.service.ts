/**
 * Statistics Service - Orchestrator for statistics calculations
 * Delegates to specialized calculators and maintains separation of concerns
 */

import { StatisticsAdapter } from "../../adapter";
import { TaskStatsCalculator } from "./task-stats-calculator";
import { RecurrenceStatsCalculator } from "./recurrence-stats-calculator";
import { OccurrenceStatsCalculator } from "./occurrence-stats-calculator";
import { CalendarStatsCalculator } from "./calendar-stats-calculator";
import { GlobalKPIsCalculator } from "./global-kpis-calculator";
import { AdvancedInsightsCalculator } from "./advanced-insights-calculator";
import type {
  AllStatistics,
  TaskStatsData,
  RecurrenceStatsData,
  OccurrenceStatsData,
  CalendarStatsData,
  GlobalKPIs,
  AdvancedInsights,
} from "~/types";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class StatisticsService {
  private adapter: StatisticsAdapter;
  private taskStatsCalculator: TaskStatsCalculator;
  private recurrenceStatsCalculator: RecurrenceStatsCalculator;
  private occurrenceStatsCalculator: OccurrenceStatsCalculator;
  private calendarStatsCalculator: CalendarStatsCalculator;
  private globalKPIsCalculator: GlobalKPIsCalculator;
  private advancedInsightsCalculator: AdvancedInsightsCalculator;

  constructor() {
    this.adapter = new StatisticsAdapter();
    this.taskStatsCalculator = new TaskStatsCalculator();
    this.recurrenceStatsCalculator = new RecurrenceStatsCalculator();
    this.occurrenceStatsCalculator = new OccurrenceStatsCalculator();
    this.calendarStatsCalculator = new CalendarStatsCalculator();
    this.globalKPIsCalculator = new GlobalKPIsCalculator();
    this.advancedInsightsCalculator = new AdvancedInsightsCalculator();
  }

  /**
   * Get all statistics for a user (legacy method)
   */
  async getAllStatistics(userId: string): Promise<AllStatistics> {
    try {
      // Fetch all data via adapter
      const dataset = await this.adapter.fetchUserDataset(userId);

      // Calculate all statistics sections using specialized calculators
      const [taskStats, recurrenceStats, occurrenceStats, calendarStats, globalKPIs, insights] =
        await Promise.all([
          Promise.resolve(this.taskStatsCalculator.calculate(dataset)),
          Promise.resolve(this.recurrenceStatsCalculator.calculate(dataset)),
          Promise.resolve(this.occurrenceStatsCalculator.calculate(dataset)),
          Promise.resolve(this.calendarStatsCalculator.calculate(dataset)),
          Promise.resolve(this.globalKPIsCalculator.calculate(dataset)),
          Promise.resolve(this.advancedInsightsCalculator.calculate(dataset)),
        ]);

      return {
        taskStats,
        recurrenceStats,
        occurrenceStats,
        calendarStats,
        globalKPIs,
        insights,
      };
    } catch (error) {
      console.error("Error fetching all statistics:", error);
      throw new Error("Failed to fetch statistics");
    }
  }

  /**
   * Get task statistics only
   */
  async getTaskStats(userId: string): Promise<TaskStatsData> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.taskStatsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      throw new Error("Failed to fetch task statistics");
    }
  }

  /**
   * Get recurrence statistics only
   */
  async getRecurrenceStats(userId: string): Promise<RecurrenceStatsData> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.recurrenceStatsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching recurrence stats:", error);
      throw new Error("Failed to fetch recurrence statistics");
    }
  }

  /**
   * Get occurrence statistics only
   */
  async getOccurrenceStats(userId: string): Promise<OccurrenceStatsData> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.occurrenceStatsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching occurrence stats:", error);
      throw new Error("Failed to fetch occurrence statistics");
    }
  }

  /**
   * Get calendar statistics only
   */
  async getCalendarStats(userId: string): Promise<CalendarStatsData> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.calendarStatsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching calendar stats:", error);
      throw new Error("Failed to fetch calendar statistics");
    }
  }

  /**
   * Get global KPIs only
   */
  async getGlobalKPIs(userId: string): Promise<GlobalKPIs> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.globalKPIsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching global KPIs:", error);
      throw new Error("Failed to fetch global KPIs");
    }
  }

  /**
   * Get advanced insights only
   */
  async getInsights(userId: string): Promise<AdvancedInsights> {
    try {
      const dataset = await this.adapter.fetchUserDataset(userId);
      return this.advancedInsightsCalculator.calculate(dataset);
    } catch (error) {
      console.error("Error fetching insights:", error);
      throw new Error("Failed to fetch insights");
    }
  }
}

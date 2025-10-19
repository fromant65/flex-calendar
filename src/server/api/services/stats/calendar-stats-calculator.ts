/**
 * Calendar Stats Calculator - Handles calendar event statistics
 */

import type { CalendarStatsData, HourlyDistribution } from "~/types";
import type { StatsDataset, StatsEvent } from "./stats-types";

export class CalendarStatsCalculator {
  /**
   * Calculate all calendar statistics
   */
  calculate(dataset: StatsDataset): CalendarStatsData {
    try {
      const { events: userEvents = [] } = dataset;

      // Validate data
      if (!Array.isArray(userEvents)) {
        console.warn("Invalid data structure in calculateCalendarStats");
        return this.getDefaultStats();
      }

      if (userEvents.length === 0) {
        return this.getDefaultStats();
      }

      const completedCount = userEvents.filter((e) => e?.isCompleted === true).length;
      const incompleteCount = userEvents.filter((e) => e?.isCompleted !== true).length;

      return {
        completedVsIncomplete: {
          completed: completedCount,
          incomplete: incompleteCount,
        },
        hourlyDistribution: this.calculateHourlyDistribution(userEvents),
        complianceRate: userEvents.length > 0 ? (completedCount / userEvents.length) * 100 : 0,
      };
    } catch (error) {
      console.error("Error calculating calendar stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate hourly distribution of events
   */
  private calculateHourlyDistribution(userEvents: StatsEvent[]): HourlyDistribution[] {
    const hourlyData = new Map<number, { count: number; completed: number }>();

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyData.set(hour, { count: 0, completed: 0 });
    }

    // Process events
    for (const event of userEvents) {
      if (!event?.start) continue;

      try {
        const startDate = new Date(event.start);
        if (isNaN(startDate.getTime())) continue;

        const startHour = startDate.getHours();
        const data = hourlyData.get(startHour)!;
        data.count++;
        if (event.isCompleted) {
          data.completed++;
        }
      } catch (error) {
        continue; // Skip invalid events
      }
    }

    return Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      count: data.count,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
    }));
  }

  /**
   * Get default stats when data is unavailable
   */
  private getDefaultStats(): CalendarStatsData {
    const hourlyDistribution: HourlyDistribution[] = [];
    for (let hour = 0; hour < 24; hour++) {
      hourlyDistribution.push({ hour, count: 0, completionRate: 0 });
    }

    return {
      completedVsIncomplete: {
        completed: 0,
        incomplete: 0,
      },
      hourlyDistribution,
      complianceRate: 0,
    };
  }
}

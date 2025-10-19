/**
 * Occurrence Stats Calculator - Handles occurrence-related statistics
 */

import type { OccurrenceStatsData, OccurrencesPeriod } from "~/types";
import { StatsUtils } from "./stats-utils";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class OccurrenceStatsCalculator {
  /**
   * Calculate all occurrence statistics
   */
  calculate(dataset: UserDataset): OccurrenceStatsData {
    try {
      const { occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences)) {
        console.warn("Invalid data structure in calculateOccurrenceStats");
        return this.getDefaultStats();
      }

      // Filter valid occurrences
      const validOccurrences = occurrences.filter((occ) => occ?.startDate);

      if (validOccurrences.length === 0) {
        return this.getDefaultStats();
      }

      return {
        occurrencesByPeriod: this.calculateOccurrencesByPeriod(validOccurrences),
        statusDistribution: this.calculateStatusDistribution(validOccurrences),
        averageTimeDeviation: this.calculateAverageTimeDeviation(validOccurrences),
        averageUrgency: this.calculateAverageUrgency(validOccurrences),
        averageResolutionTime: this.calculateAverageResolutionTime(validOccurrences),
      };
    } catch (error) {
      console.error("Error calculating occurrence stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate occurrences grouped by period (weekly)
   */
  private calculateOccurrencesByPeriod(validOccurrences: any[]): OccurrencesPeriod[] {
    const periodCount = new Map<string, number>();

    for (const occ of validOccurrences) {
      try {
        const date = new Date(occ.startDate);
        if (isNaN(date.getTime())) continue;

        const weekKey = StatsUtils.getWeekKey(date);
        periodCount.set(weekKey, (periodCount.get(weekKey) || 0) + 1);
      } catch (error) {
        continue; // Skip invalid dates
      }
    }

    return Array.from(periodCount.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period, count }));
  }

  /**
   * Calculate status distribution
   */
  private calculateStatusDistribution(validOccurrences: any[]) {
    return {
      pending: validOccurrences.filter((o) => o?.status === "Pending").length,
      inProgress: validOccurrences.filter((o) => o?.status === "In Progress").length,
      completed: validOccurrences.filter((o) => o?.status === "Completed").length,
      skipped: validOccurrences.filter((o) => o?.status === "Skipped").length,
    };
  }

  /**
   * Calculate average time deviation from target
   */
  private calculateAverageTimeDeviation(validOccurrences: any[]): number | null {
    const deviations = validOccurrences
      .filter(
        (o) =>
          o?.timeConsumed !== null &&
          o?.timeConsumed !== undefined &&
          o?.targetTimeConsumption !== null &&
          o?.targetTimeConsumption !== undefined
      )
      .map((o) => (o.timeConsumed! - o.targetTimeConsumption!) / 60); // Convert to hours

    if (deviations.length === 0) return null;

    return deviations.reduce((a, b) => a + b, 0) / deviations.length;
  }

  /**
   * Calculate average urgency
   */
  private calculateAverageUrgency(validOccurrences: any[]): number | null {
    const urgencies = validOccurrences
      .filter((o) => o?.urgency !== null && o?.urgency !== undefined)
      .map((o) => o.urgency!);

    if (urgencies.length === 0) return null;

    return urgencies.reduce((a, b) => a + b, 0) / urgencies.length;
  }

  /**
   * Calculate average time to complete occurrences
   */
  private calculateAverageResolutionTime(validOccurrences: any[]): number | null {
    const resolutionTimes = validOccurrences
      .filter((o) => o?.completedAt)
      .map((o) => {
        try {
          const start = new Date(o.startDate).getTime();
          const end = new Date(o.completedAt!).getTime();
          if (isNaN(start) || isNaN(end)) return 0;
          return (end - start) / (1000 * 60 * 60); // Hours
        } catch {
          return 0;
        }
      })
      .filter((time) => time > 0);

    if (resolutionTimes.length === 0) return null;

    return resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
  }

  /**
   * Get default stats when data is unavailable
   */
  private getDefaultStats(): OccurrenceStatsData {
    return {
      occurrencesByPeriod: [],
      statusDistribution: {
        pending: 0,
        inProgress: 0,
        completed: 0,
        skipped: 0,
      },
      averageTimeDeviation: null,
      averageUrgency: null,
      averageResolutionTime: null,
    };
  }
}

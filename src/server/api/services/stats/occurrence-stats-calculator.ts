/**
 * Occurrence Stats Calculator - Handles occurrence-related statistics
 */

import type { OccurrenceStatsData, OccurrencesPeriod } from "~/types";
import type { StatsDataset, StatsOccurrence } from "./stats-types";
import { StatsUtils } from "./stats-utils";
import { UrgencyCalculator } from "../../utils/urgency-calculator";
import { OccurrenceStatsInsightsGenerator } from "./insights-generators";

export class OccurrenceStatsCalculator {
  /**
   * Calculate all occurrence statistics
   */
  calculate(dataset: StatsDataset): OccurrenceStatsData {
    try {
      const { occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences)) {
        console.error("[OccurrenceStats] Invalid data structure - occurrences is not an array");
        return this.getDefaultStats();
      }

      console.log(`[OccurrenceStats] Processing ${occurrences.length} occurrences`);

      // Filter valid occurrences
      const validOccurrences = occurrences.filter((occ) => occ?.startDate);

      console.log(`[OccurrenceStats] Found ${validOccurrences.length} valid occurrences`);

      if (validOccurrences.length === 0) {
        console.log("[OccurrenceStats] No valid occurrences, returning default stats");
        return this.getDefaultStats();
      }

      const stats: OccurrenceStatsData = {
        occurrencesByPeriod: this.calculateOccurrencesByPeriod(validOccurrences),
        statusDistribution: this.calculateStatusDistribution(validOccurrences),
        averageTimeDeviation: this.calculateAverageTimeDeviation(validOccurrences),
        averageUrgency: this.calculateAverageUrgency(validOccurrences),
        averageResolutionTime: this.calculateAverageResolutionTime(validOccurrences),
      };

      // Generate insights
      stats.insights = OccurrenceStatsInsightsGenerator.generate(stats);

      console.log("[OccurrenceStats] Calculation completed successfully");
      return stats;
    } catch (error) {
      console.error("[OccurrenceStats] Error calculating occurrence stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate occurrences grouped by period (weekly)
   */
  private calculateOccurrencesByPeriod(validOccurrences: StatsOccurrence[]): OccurrencesPeriod[] {
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
  private calculateStatusDistribution(validOccurrences: StatsOccurrence[]) {
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
  private calculateAverageTimeDeviation(validOccurrences: StatsOccurrence[]): number | null {
    const deviations: number[] = [];

    for (const occ of validOccurrences) {
      // Check if both values exist and are valid numbers
      if (
        occ?.timeConsumed == null ||
        occ?.targetTimeConsumption == null ||
        typeof occ.timeConsumed !== "number" ||
        typeof occ.targetTimeConsumption !== "number"
      ) {
        continue;
      }

      // Skip invalid values (negative or extremely large)
      if (
        occ.timeConsumed < 0 ||
        occ.targetTimeConsumption < 0 ||
        occ.timeConsumed > 10000 || // More than ~166 hours seems unrealistic
        occ.targetTimeConsumption > 10000
      ) {
        console.warn(
          `[OccurrenceStats] Invalid time values for occurrence ${occ.id}:`,
          { timeConsumed: occ.timeConsumed, target: occ.targetTimeConsumption }
        );
        continue;
      }

      const deviationMinutes = occ.timeConsumed - occ.targetTimeConsumption;
      const deviationHours = deviationMinutes / 60; // Convert to hours
      deviations.push(deviationHours);
    }

    if (deviations.length === 0) {
      console.log("[OccurrenceStats] No valid time deviation data found");
      return null;
    }

    const average = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    console.log(
      `[OccurrenceStats] Calculated average time deviation: ${average.toFixed(2)} hours from ${deviations.length} occurrences`
    );
    return average;
  }

  /**
   * Calculate average urgency dynamically
   */
  private calculateAverageUrgency(validOccurrences: StatsOccurrence[]): number | null {
    const urgencies: number[] = [];
    const currentDate = new Date();

    for (const occ of validOccurrences) {
      try {
        // Calculate urgency dynamically based on dates
        const result = UrgencyCalculator.calculateUrgency({
          currentDate,
          creationDate: occ.createdAt,
          targetDate: occ.targetDate ?? undefined,
          limitDate: occ.limitDate ?? undefined,
        });

        // For completed occurrences, use the completion date instead of current date
        if (occ.completedAt) {
          const completedResult = UrgencyCalculator.calculateUrgency({
            currentDate: occ.completedAt,
            creationDate: occ.createdAt,
            targetDate: occ.targetDate ?? undefined,
            limitDate: occ.limitDate ?? undefined,
          });
          urgencies.push(completedResult.urgency);
        } else {
          urgencies.push(result.urgency);
        }
      } catch (error) {
        console.error(`[OccurrenceStats] Error calculating urgency for occurrence ${occ.id}:`, error);
        continue;
      }
    }

    if (urgencies.length === 0) {
      console.log("[OccurrenceStats] No valid urgency data found");
      return null;
    }

    const average = urgencies.reduce((a, b) => a + b, 0) / urgencies.length;
    console.log(
      `[OccurrenceStats] Calculated average urgency: ${average.toFixed(2)} from ${urgencies.length} occurrences`
    );
    return average;
  }

  /**
   * Calculate average time to complete occurrences
   */
  private calculateAverageResolutionTime(validOccurrences: StatsOccurrence[]): number | null {
    const resolutionTimes: number[] = [];

    for (const occ of validOccurrences) {
      if (!occ?.completedAt || !occ?.startDate) continue;

      try {
        const start = new Date(occ.startDate);
        const end = new Date(occ.completedAt);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(
            `[OccurrenceStats] Invalid dates for occurrence ${occ.id}:`,
            { startDate: occ.startDate, completedAt: occ.completedAt }
          );
          continue;
        }

        const timeMs = end.getTime() - start.getTime();
        const hours = timeMs / (1000 * 60 * 60);

        // Only count positive durations (completed after start)
        if (hours > 0 && hours < 8760) {
          // Less than 1 year
          resolutionTimes.push(hours);
        } else if (hours <= 0) {
          console.warn(
            `[OccurrenceStats] Negative or zero resolution time for occurrence ${occ.id}: ${hours} hours`
          );
        } else {
          console.warn(
            `[OccurrenceStats] Unrealistic resolution time for occurrence ${occ.id}: ${hours} hours`
          );
        }
      } catch (error) {
        console.error(`[OccurrenceStats] Error processing occurrence ${occ.id}:`, error);
        continue;
      }
    }

    if (resolutionTimes.length === 0) {
      console.log("[OccurrenceStats] No valid resolution times found");
      return null;
    }

    const average = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
    console.log(
      `[OccurrenceStats] Calculated average resolution time: ${average.toFixed(2)} hours from ${resolutionTimes.length} occurrences`
    );
    return average;
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

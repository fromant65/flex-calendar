/**
 * Global KPIs Calculator - Handles global key performance indicators
 */

import type { GlobalKPIs, WorkloadData, ImportanceBalance, UrgencyBalance } from "~/types";
import type { StatsDataset, StatsOccurrence, StatsEvent, StatsTask } from "./stats-types";
import { GlobalKPIsInsightsGenerator } from "./insights-generators";

export class GlobalKPIsCalculator {
  /**
   * Calculate all global KPIs
   */
  calculate(dataset: StatsDataset): GlobalKPIs {
    try {
      const { occurrences = [], events: userEvents = [], tasks: userTasks = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences) || !Array.isArray(userEvents)) {
        console.error("[GlobalKPIs] Invalid data structure:", {
          occurrencesIsArray: Array.isArray(occurrences),
          eventsIsArray: Array.isArray(userEvents),
        });
        return this.getDefaultKPIs();
      }

      console.log(
        `[GlobalKPIs] Processing ${occurrences.length} occurrences, ${userEvents.length} events, ${userTasks.length} tasks`
      );

      // Filter valid occurrences
      const validOccurrences = occurrences.filter((occ) => occ != null);

      const kpis: GlobalKPIs = {
        completionRate: this.calculateCompletionRate(validOccurrences),
        totalTimeInvested: this.calculateTotalTimeInvested(validOccurrences, userEvents),
        planningEfficiency: this.calculatePlanningEfficiency(validOccurrences, userEvents),
        averageWorkload: this.calculateAverageWorkload(userEvents),
        importanceBalance: this.calculateImportanceBalance(validOccurrences, userTasks),
        urgencyBalance: this.calculateUrgencyBalance(validOccurrences),
      };

      // Generate insights
      kpis.insights = GlobalKPIsInsightsGenerator.generate(kpis);

      console.log("[GlobalKPIs] Calculation completed successfully");
      return kpis;
    } catch (error) {
      console.error("[GlobalKPIs] Error calculating global KPIs:", error);
      return this.getDefaultKPIs();
    }
  }

  /**
   * Calculate overall completion rate
   */
  private calculateCompletionRate(validOccurrences: StatsOccurrence[]): number {
    if (validOccurrences.length === 0) return 0;

    const completedOccurrences = validOccurrences.filter((o) => o?.status === "Completed").length;
    return (completedOccurrences / validOccurrences.length) * 100;
  }

  /**
   * Calculate total time invested in tasks and events
   */
  private calculateTotalTimeInvested(validOccurrences: StatsOccurrence[], userEvents: StatsEvent[]): number {
    let invalidOccurrenceTimes = 0;
    let invalidEventDurations = 0;

    // Time from occurrences (in minutes, convert to hours)
    const occurrenceTime = validOccurrences.reduce((sum, occ) => {
      if (!occ?.timeConsumed) return sum;

      if (typeof occ.timeConsumed !== "number" || occ.timeConsumed < 0) {
        invalidOccurrenceTimes++;
        return sum;
      }

      return sum + occ.timeConsumed / 60; // Convert minutes to hours
    }, 0);

    // Time from events (calculate duration)
    const eventTime = userEvents.reduce((sum, event) => {
      if (!event?.start || !event?.finish) return sum;

      try {
        const startTime = new Date(event.start);
        const finishTime = new Date(event.finish);

        if (isNaN(startTime.getTime()) || isNaN(finishTime.getTime())) {
          invalidEventDurations++;
          return sum;
        }

        const durationMs = finishTime.getTime() - startTime.getTime();
        const hours = durationMs / (1000 * 60 * 60);

        // Only count positive durations less than 24 hours (reasonable event length)
        if (hours > 0 && hours <= 24) {
          return sum + hours;
        } else if (hours > 24) {
          console.warn(
            `[GlobalKPIs] Unusually long event duration for event ${event.id}: ${hours.toFixed(2)} hours`
          );
          return sum + hours; // Still count it but log warning
        } else {
          invalidEventDurations++;
          return sum;
        }
      } catch (error) {
        console.error(`[GlobalKPIs] Error processing event ${event.id}:`, error);
        invalidEventDurations++;
        return sum;
      }
    }, 0);

    if (invalidOccurrenceTimes > 0) {
      console.warn(`[GlobalKPIs] Skipped ${invalidOccurrenceTimes} occurrences with invalid time consumed`);
    }
    if (invalidEventDurations > 0) {
      console.warn(`[GlobalKPIs] Skipped ${invalidEventDurations} events with invalid durations`);
    }

    const total = occurrenceTime + eventTime;
    console.log(
      `[GlobalKPIs] Total time invested: ${total.toFixed(2)} hours (occurrences: ${occurrenceTime.toFixed(2)}h, events: ${eventTime.toFixed(2)}h)`
    );

    return total;
  }

  /**
   * Calculate planning efficiency (dedicated time vs actual time consumed)
   */
  private calculatePlanningEfficiency(validOccurrences: StatsOccurrence[], userEvents: StatsEvent[]): number | null {
    const efficiencyRatios: number[] = [];

    for (const event of userEvents) {
      if (!event?.associatedOccurrenceId || !event?.dedicatedTime) continue;

      const occ = validOccurrences.find((o) => o?.id === event.associatedOccurrenceId);
      if (!occ?.timeConsumed || occ.timeConsumed === 0) continue;

      // Validate values
      if (
        typeof event.dedicatedTime !== "number" ||
        typeof occ.timeConsumed !== "number" ||
        event.dedicatedTime <= 0 ||
        occ.timeConsumed <= 0
      ) {
        console.warn(
          `[GlobalKPIs] Invalid efficiency values for event ${event.id}:`,
          { dedicatedTime: event.dedicatedTime, timeConsumed: occ.timeConsumed }
        );
        continue;
      }

      const timeConsumedHours = occ.timeConsumed / 60; // Convert minutes to hours
      const efficiency = event.dedicatedTime / timeConsumedHours;

      // Filter out unrealistic efficiency values (e.g., > 10x or < 0.1x)
      if (efficiency > 0.01 && efficiency < 100) {
        efficiencyRatios.push(efficiency);
      } else {
        console.warn(
          `[GlobalKPIs] Unrealistic efficiency ratio ${efficiency.toFixed(2)} for event ${event.id}`
        );
      }
    }

    if (efficiencyRatios.length === 0) {
      console.log("[GlobalKPIs] No valid planning efficiency data found");
      return null;
    }

    const average = efficiencyRatios.reduce((a, b) => a + b, 0) / efficiencyRatios.length;
    console.log(
      `[GlobalKPIs] Calculated planning efficiency: ${average.toFixed(2)} from ${efficiencyRatios.length} events`
    );
    return average;
  }

  /**
   * Calculate average workload per day and week
   */
  private calculateAverageWorkload(userEvents: StatsEvent[]): WorkloadData {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const weekEvents = userEvents.filter((e) => {
      if (!e?.start) return false;
      try {
        return new Date(e.start) >= weekAgo;
      } catch {
        return false;
      }
    });

    const dayEvents = userEvents.filter((e) => {
      if (!e?.start) return false;
      try {
        return new Date(e.start) >= dayAgo;
      } catch {
        return false;
      }
    });

    const weekHours = weekEvents.reduce((sum, e) => {
      if (!e?.start || !e?.finish) return sum;
      try {
        const duration =
          (new Date(e.finish).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60);
        return sum + (duration > 0 ? duration : 0);
      } catch {
        return sum;
      }
    }, 0);

    const dayHours = dayEvents.reduce((sum, e) => {
      if (!e?.start || !e?.finish) return sum;
      try {
        const duration =
          (new Date(e.finish).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60);
        return sum + (duration > 0 ? duration : 0);
      } catch {
        return sum;
      }
    }, 0);

    return {
      hoursPerDay: dayHours,
      hoursPerWeek: weekHours,
    };
  }

  /**
   * Calculate importance balance (completion rates by importance level)
   */
  private calculateImportanceBalance(
    validOccurrences: StatsOccurrence[],
    userTasks: StatsTask[]
  ): ImportanceBalance {
    const getTaskImportance = (occId: number): number => {
      const task = userTasks.find((t) =>
        validOccurrences.some((o) => o?.id === occId && o?.associatedTaskId === t?.id)
      );
      return task?.importance ?? 5;
    };

    const lowImportanceOccs = validOccurrences.filter((o) => {
      const importance = getTaskImportance(o?.id || 0);
      return importance >= 1 && importance <= 3;
    });

    const mediumImportanceOccs = validOccurrences.filter((o) => {
      const importance = getTaskImportance(o?.id || 0);
      return importance >= 4 && importance <= 7;
    });

    const highImportanceOccs = validOccurrences.filter((o) => {
      const importance = getTaskImportance(o?.id || 0);
      return importance >= 8 && importance <= 10;
    });

    return {
      lowImportanceCompletionRate:
        lowImportanceOccs.length > 0
          ? (lowImportanceOccs.filter((o) => o?.status === "Completed").length /
              lowImportanceOccs.length) *
            100
          : 0,
      mediumImportanceCompletionRate:
        mediumImportanceOccs.length > 0
          ? (mediumImportanceOccs.filter((o) => o?.status === "Completed").length /
              mediumImportanceOccs.length) *
            100
          : 0,
      highImportanceCompletionRate:
        highImportanceOccs.length > 0
          ? (highImportanceOccs.filter((o) => o?.status === "Completed").length /
              highImportanceOccs.length) *
            100
          : 0,
    };
  }

  /**
   * Calculate urgency balance (early, on-time, late completions)
   */
  private calculateUrgencyBalance(validOccurrences: StatsOccurrence[]): UrgencyBalance {
    const completedWithTiming = validOccurrences.filter(
      (o) => o?.status === "Completed" && o?.completedAt && o?.limitDate
    );

    let earlyCount = 0;
    let onTimeCount = 0;
    let lateCount = 0;

    for (const occ of completedWithTiming) {
      try {
        const completedTime = new Date(occ.completedAt!).getTime();
        const limitTime = new Date(occ.limitDate!).getTime();
        const startTime = new Date(occ.startDate).getTime();

        if (isNaN(completedTime) || isNaN(limitTime) || isNaN(startTime)) continue;

        const totalTime = limitTime - startTime;
        const usedTime = completedTime - startTime;

        if (totalTime <= 0) continue;

        const remainingPercent = ((totalTime - usedTime) / totalTime) * 100;

        if (remainingPercent > 50) earlyCount++;
        else if (remainingPercent >= 10) onTimeCount++;
        else lateCount++;
      } catch (error) {
        continue; // Skip invalid timing data
      }
    }

    return {
      earlyCompletionRate:
        completedWithTiming.length > 0 ? (earlyCount / completedWithTiming.length) * 100 : 0,
      onTimeCompletionRate:
        completedWithTiming.length > 0 ? (onTimeCount / completedWithTiming.length) * 100 : 0,
      lateCompletionRate:
        completedWithTiming.length > 0 ? (lateCount / completedWithTiming.length) * 100 : 0,
    };
  }

  /**
   * Get default KPIs when data is unavailable
   */
  private getDefaultKPIs(): GlobalKPIs {
    return {
      completionRate: 0,
      totalTimeInvested: 0,
      planningEfficiency: null,
      averageWorkload: {
        hoursPerDay: 0,
        hoursPerWeek: 0,
      },
      importanceBalance: {
        lowImportanceCompletionRate: 0,
        mediumImportanceCompletionRate: 0,
        highImportanceCompletionRate: 0,
      },
      urgencyBalance: {
        earlyCompletionRate: 0,
        onTimeCompletionRate: 0,
        lateCompletionRate: 0,
      },
    };
  }
}

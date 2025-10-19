/**
 * Global KPIs Calculator - Handles global key performance indicators
 */

import type { GlobalKPIs, WorkloadData, ImportanceBalance, UrgencyBalance } from "~/types";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class GlobalKPIsCalculator {
  /**
   * Calculate all global KPIs
   */
  calculate(dataset: UserDataset): GlobalKPIs {
    try {
      const { occurrences = [], events: userEvents = [], tasks: userTasks = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences) || !Array.isArray(userEvents)) {
        console.warn("Invalid data structure in calculateGlobalKPIs");
        return this.getDefaultKPIs();
      }

      // Filter valid occurrences
      const validOccurrences = occurrences.filter((occ) => occ != null);

      return {
        completionRate: this.calculateCompletionRate(validOccurrences),
        totalTimeInvested: this.calculateTotalTimeInvested(validOccurrences, userEvents),
        planningEfficiency: this.calculatePlanningEfficiency(validOccurrences, userEvents),
        averageWorkload: this.calculateAverageWorkload(userEvents),
        importanceBalance: this.calculateImportanceBalance(validOccurrences, userTasks),
        urgencyBalance: this.calculateUrgencyBalance(validOccurrences),
      };
    } catch (error) {
      console.error("Error calculating global KPIs:", error);
      return this.getDefaultKPIs();
    }
  }

  /**
   * Calculate overall completion rate
   */
  private calculateCompletionRate(validOccurrences: any[]): number {
    if (validOccurrences.length === 0) return 0;

    const completedOccurrences = validOccurrences.filter((o) => o?.status === "Completed").length;
    return (completedOccurrences / validOccurrences.length) * 100;
  }

  /**
   * Calculate total time invested in tasks and events
   */
  private calculateTotalTimeInvested(validOccurrences: any[], userEvents: any[]): number {
    // Time from occurrences
    const occurrenceTime =
      validOccurrences
        .filter((o) => o?.timeConsumed)
        .reduce((sum, o) => sum + (o.timeConsumed || 0), 0) / 60; // Convert to hours

    // Time from events
    const eventTime = userEvents.reduce((sum, e) => {
      if (!e?.start || !e?.finish) return sum;
      try {
        const startTime = new Date(e.start).getTime();
        const finishTime = new Date(e.finish).getTime();
        if (isNaN(startTime) || isNaN(finishTime)) return sum;
        const duration = (finishTime - startTime) / (1000 * 60 * 60);
        return sum + (duration > 0 ? duration : 0);
      } catch {
        return sum;
      }
    }, 0);

    return occurrenceTime + eventTime;
  }

  /**
   * Calculate planning efficiency (dedicated time vs actual time consumed)
   */
  private calculatePlanningEfficiency(validOccurrences: any[], userEvents: any[]): number | null {
    const efficiencyData = userEvents
      .filter((e) => e?.associatedOccurrenceId && e?.dedicatedTime)
      .map((e) => {
        const occ = validOccurrences.find((o) => o?.id === e.associatedOccurrenceId);
        if (!occ || !occ.timeConsumed || occ.timeConsumed === 0) return null;
        return e.dedicatedTime! / (occ.timeConsumed / 60);
      })
      .filter((x): x is number => x !== null && !isNaN(x) && isFinite(x));

    if (efficiencyData.length === 0) return null;

    return efficiencyData.reduce((a, b) => a + b, 0) / efficiencyData.length;
  }

  /**
   * Calculate average workload per day and week
   */
  private calculateAverageWorkload(userEvents: any[]): WorkloadData {
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
    validOccurrences: any[],
    userTasks: any[]
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
  private calculateUrgencyBalance(validOccurrences: any[]): UrgencyBalance {
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

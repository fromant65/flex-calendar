/**
 * Statistics Service - Business logic for statistics calculations
 * Maintains separation of concerns by using adapters for data access
 */

import { StatisticsAdapter } from "../adapter";
import type {
  AllStatistics,
  TaskStatsData,
  RecurrenceStatsData,
  OccurrenceStatsData,
  CalendarStatsData,
  GlobalKPIs,
  AdvancedInsights,
  ImportanceDistribution,
  HabitCompliancePoint,
  DayFrequency,
  OccurrencesPeriod,
  HourlyDistribution,
  WorkloadData,
  ImportanceBalance,
  UrgencyBalance,
  LowComplianceHabit,
  TrendPoint,
  Bottleneck,
  DayOfWeek,
} from "~/types";

interface UserDataset {
  tasks: any[];
  occurrences: any[];
  events: any[];
  recurrenceMap: Map<number, any>;
}

export class StatisticsService {
  private adapter: StatisticsAdapter;

  constructor() {
    this.adapter = new StatisticsAdapter();
  }

  /**
   * Get all statistics for a user (legacy method)
   */
  async getAllStatistics(userId: string): Promise<AllStatistics> {
    try {
      // Fetch all data via adapter
      const dataset = await this.adapter.fetchUserDataset(userId);

      // Calculate all statistics sections
      const [taskStats, recurrenceStats, occurrenceStats, calendarStats, globalKPIs, insights] =
        await Promise.all([
          this.calculateTaskStats(dataset),
          this.calculateRecurrenceStats(dataset),
          this.calculateOccurrenceStats(dataset),
          this.calculateCalendarStats(dataset),
          this.calculateGlobalKPIs(dataset),
          this.calculateInsights(dataset),
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
      return await this.calculateTaskStats(dataset);
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
      return await this.calculateRecurrenceStats(dataset);
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
      return await this.calculateOccurrenceStats(dataset);
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
      return await this.calculateCalendarStats(dataset);
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
      return await this.calculateGlobalKPIs(dataset);
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
      return await this.calculateInsights(dataset);
    } catch (error) {
      console.error("Error fetching insights:", error);
      throw new Error("Failed to fetch insights");
    }
  }

  /**
   * Calculate task statistics
   */
  private async calculateTaskStats(dataset: UserDataset): Promise<TaskStatsData> {
    try {
      const { tasks: userTasks = [], occurrences = [], recurrenceMap } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences)) {
        console.warn("Invalid data structure in calculateTaskStats");
        return this.getDefaultTaskStats();
      }

      // Average completion time (from creation to completion)
      const completedTasks = userTasks.filter((t) => t?.completedAt);
      const avgCompletionTime =
        completedTasks.length > 0
          ? completedTasks.reduce((sum, t) => {
              try {
                const completed = new Date(t.completedAt!);
                const created = new Date(t.createdAt);
                if (isNaN(completed.getTime()) || isNaN(created.getTime())) {
                  return sum;
                }
                const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
                return sum + (hours > 0 ? hours : 0);
              } catch {
                return sum;
              }
            }, 0) / completedTasks.length
          : null;

      // Importance distribution
      const importanceGroups = new Map<number, { total: number; completed: number }>();

      for (const occ of occurrences) {
        if (!occ?.associatedTaskId) continue;
        
        const task = userTasks.find((t) => t?.id === occ.associatedTaskId);
        if (!task) continue;

        const importance = task.importance ?? 1;
        if (!importanceGroups.has(importance)) {
          importanceGroups.set(importance, { total: 0, completed: 0 });
        }
        const group = importanceGroups.get(importance)!;
        group.total++;
        if (occ.status === "Completed") {
          group.completed++;
        }
      }

      const importanceDistribution: ImportanceDistribution[] = Array.from(
        importanceGroups.entries()
      )
        .map(([importance, data]) => ({
          importance,
          completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
          totalOccurrences: data.total,
          completedOccurrences: data.completed,
        }))
        .sort((a, b) => a.importance - b.importance);

      // Fixed vs Flexible
      const fixedCount = userTasks.filter((t) => t?.isFixed === true).length;
      const flexibleCount = userTasks.filter((t) => t?.isFixed === false).length;

      // Recurring vs Unique
      const recurringCount = userTasks.filter((t) => t?.recurrenceId !== null && t?.recurrenceId !== undefined).length;
      const uniqueCount = userTasks.filter((t) => t?.recurrenceId === null || t?.recurrenceId === undefined).length;

      return {
        averageCompletionTime: avgCompletionTime,
        importanceDistribution,
        fixedVsFlexible: {
          fixed: fixedCount,
          flexible: flexibleCount,
        },
        recurringVsUnique: {
          recurring: recurringCount,
          unique: uniqueCount,
        },
      };
    } catch (error) {
      console.error("Error calculating task stats:", error);
      return this.getDefaultTaskStats();
    }
  }

  /**
   * Get default task stats when data is unavailable
   */
  private getDefaultTaskStats(): TaskStatsData {
    return {
      averageCompletionTime: null,
      importanceDistribution: [],
      fixedVsFlexible: { fixed: 0, flexible: 0 },
      recurringVsUnique: { recurring: 0, unique: 0 },
    };
  }

  /**
   * Calculate recurrence statistics (habits)
   */
  private async calculateRecurrenceStats(dataset: UserDataset): Promise<RecurrenceStatsData> {
    try {
      const { tasks: userTasks = [], occurrences = [], recurrenceMap } = dataset;

      // Validate data
      if (!Array.isArray(userTasks) || !Array.isArray(occurrences) || !recurrenceMap) {
        console.warn("Invalid data structure in calculateRecurrenceStats");
        return this.getDefaultRecurrenceStats();
      }

      // Filter habits (tasks with recurrence and no maxOccurrences or maxOccurrences > 10)
      const habitTasks = userTasks.filter((t) => {
        if (!t?.recurrenceId) return false;
        const rec = recurrenceMap.get(t.recurrenceId);
        return rec && (!rec.maxOccurrences || rec.maxOccurrences > 10);
      });

      if (habitTasks.length === 0) {
        return this.getDefaultRecurrenceStats();
      }

      const habitTaskIds = new Set(habitTasks.map((t) => t.id));
      const habitOccurrences = occurrences.filter((o) => o?.associatedTaskId && habitTaskIds.has(o.associatedTaskId));

      // Habit compliance over time (group by week)
      const complianceByWeek = new Map<string, { completed: number; total: number }>();

      for (const occ of habitOccurrences) {
        if (!occ?.startDate) continue;
        
        try {
          const date = new Date(occ.startDate);
          if (isNaN(date.getTime())) continue;
          
          const weekKey = this.getWeekKey(date);

          if (!complianceByWeek.has(weekKey)) {
            complianceByWeek.set(weekKey, { completed: 0, total: 0 });
          }
          
          const week = complianceByWeek.get(weekKey)!;
          week.total++;
          if (occ.status === "Completed") {
            week.completed++;
          }
        } catch (error) {
          continue; // Skip invalid occurrences
        }
      }

      const habitCompliance: HabitCompliancePoint[] = Array.from(complianceByWeek.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekKey, data]) => ({
          date: this.getDateFromWeekKey(weekKey),
          completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
          completedOccurrences: data.completed,
          totalOccurrences: data.total,
        }));

      // Calculate streaks
      const { maxStreak, currentStreak } = this.calculateStreaks(habitCompliance);

      // Frequent days
      const dayCount = new Map<string, { completed: number; total: number }>();
      const dayNames: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      for (const occ of habitOccurrences) {
        try {
          if (occ?.completedAt) {
            const date = new Date(occ.completedAt);
            if (!isNaN(date.getTime())) {
              const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
              const dayName = dayNames[dayIndex];

              if (dayName && !dayCount.has(dayName)) {
                dayCount.set(dayName, { completed: 0, total: 0 });
              }
              if (dayName) {
                const day = dayCount.get(dayName)!;
                day.completed++;
              }
            }
          }

          if (occ?.startDate) {
            const date = new Date(occ.startDate);
            if (!isNaN(date.getTime())) {
              const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
              const dayName = dayNames[dayIndex];
              if (dayName && !dayCount.has(dayName)) {
                dayCount.set(dayName, { completed: 0, total: 0 });
              }
              if (dayName) {
                dayCount.get(dayName)!.total++;
              }
            }
          }
        } catch (error) {
          continue; // Skip invalid occurrences
        }
      }

      const frequentDays: DayFrequency[] = dayNames.map((day) => {
        const data = dayCount.get(day) || { completed: 0, total: 0 };
        return {
          day,
          completionCount: data.completed,
          completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        };
      });

      return {
        habitCompliance,
        maxStreak,
        currentStreak,
        frequentDays,
      };
    } catch (error) {
      console.error("Error calculating recurrence stats:", error);
      return this.getDefaultRecurrenceStats();
    }
  }

  /**
   * Get default recurrence stats when data is unavailable
   */
  private getDefaultRecurrenceStats(): RecurrenceStatsData {
    return {
      habitCompliance: [],
      maxStreak: 0,
      currentStreak: 0,
      frequentDays: [
        { day: "Mon", completionCount: 0, completionRate: 0 },
        { day: "Tue", completionCount: 0, completionRate: 0 },
        { day: "Wed", completionCount: 0, completionRate: 0 },
        { day: "Thu", completionCount: 0, completionRate: 0 },
        { day: "Fri", completionCount: 0, completionRate: 0 },
        { day: "Sat", completionCount: 0, completionRate: 0 },
        { day: "Sun", completionCount: 0, completionRate: 0 },
      ],
    };
  }

  /**
   * Calculate occurrence statistics
   */
  private async calculateOccurrenceStats(dataset: UserDataset): Promise<OccurrenceStatsData> {
    try {
      const { occurrences = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences)) {
        console.warn("Invalid data structure in calculateOccurrenceStats");
        return this.getDefaultOccurrenceStats();
      }

      // Filter valid occurrences
      const validOccurrences = occurrences.filter(occ => occ?.startDate);

      if (validOccurrences.length === 0) {
        return this.getDefaultOccurrenceStats();
      }

      // Occurrences by period (weekly)
      const periodCount = new Map<string, number>();

      for (const occ of validOccurrences) {
        try {
          const date = new Date(occ.startDate);
          if (isNaN(date.getTime())) continue;
          
          const weekKey = this.getWeekKey(date);
          periodCount.set(weekKey, (periodCount.get(weekKey) || 0) + 1);
        } catch (error) {
          continue; // Skip invalid dates
        }
      }

      const occurrencesByPeriod: OccurrencesPeriod[] = Array.from(periodCount.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, count]) => ({ period, count }));

      // Status distribution
      const statusDistribution = {
        pending: validOccurrences.filter((o) => o?.status === "Pending").length,
        inProgress: validOccurrences.filter((o) => o?.status === "In Progress").length,
        completed: validOccurrences.filter((o) => o?.status === "Completed").length,
        skipped: validOccurrences.filter((o) => o?.status === "Skipped").length,
      };

      // Average time deviation
      const deviations = validOccurrences
        .filter((o) => 
          o?.timeConsumed !== null && 
          o?.timeConsumed !== undefined &&
          o?.targetTimeConsumption !== null && 
          o?.targetTimeConsumption !== undefined
        )
        .map((o) => (o.timeConsumed! - o.targetTimeConsumption!) / 60); // Convert to hours

      const averageTimeDeviation =
        deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : null;

      // Average urgency
      const urgencies = validOccurrences
        .filter((o) => o?.urgency !== null && o?.urgency !== undefined)
        .map((o) => o.urgency!);
      const averageUrgency =
        urgencies.length > 0 ? urgencies.reduce((a, b) => a + b, 0) / urgencies.length : null;

      // Average resolution time
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
        .filter(time => time > 0);

      const averageResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
          : null;

      return {
        occurrencesByPeriod,
        statusDistribution,
        averageTimeDeviation,
        averageUrgency,
        averageResolutionTime,
      };
    } catch (error) {
      console.error("Error calculating occurrence stats:", error);
      return this.getDefaultOccurrenceStats();
    }
  }

  /**
   * Get default occurrence stats when data is unavailable
   */
  private getDefaultOccurrenceStats(): OccurrenceStatsData {
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

  /**
   * Calculate calendar statistics
   */
  private async calculateCalendarStats(dataset: UserDataset): Promise<CalendarStatsData> {
    try {
      const { events: userEvents = [] } = dataset;

      // Validate data
      if (!Array.isArray(userEvents)) {
        console.warn("Invalid data structure in calculateCalendarStats");
        return this.getDefaultCalendarStats();
      }

      if (userEvents.length === 0) {
        return this.getDefaultCalendarStats();
      }

      // Completed vs incomplete
      const completedCount = userEvents.filter((e) => e?.isCompleted === true).length;
      const incompleteCount = userEvents.filter((e) => e?.isCompleted !== true).length;

      // Hourly distribution
      const hourlyData = new Map<number, { count: number; completed: number }>();

      for (let hour = 0; hour < 24; hour++) {
        hourlyData.set(hour, { count: 0, completed: 0 });
      }

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

      const hourlyDistribution: HourlyDistribution[] = Array.from(hourlyData.entries()).map(
        ([hour, data]) => ({
          hour,
          count: data.count,
          completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
        })
      );

      // Compliance rate
      const complianceRate = userEvents.length > 0 ? (completedCount / userEvents.length) * 100 : 0;

      return {
        completedVsIncomplete: {
          completed: completedCount,
          incomplete: incompleteCount,
        },
        hourlyDistribution,
        complianceRate,
      };
    } catch (error) {
      console.error("Error calculating calendar stats:", error);
      return this.getDefaultCalendarStats();
    }
  }

  /**
   * Get default calendar stats when data is unavailable
   */
  private getDefaultCalendarStats(): CalendarStatsData {
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

  /**
   * Calculate global KPIs
   */
  private async calculateGlobalKPIs(dataset: UserDataset): Promise<GlobalKPIs> {
    try {
      const { occurrences = [], events: userEvents = [], tasks: userTasks = [] } = dataset;

      // Validate data
      if (!Array.isArray(occurrences) || !Array.isArray(userEvents)) {
        console.warn("Invalid data structure in calculateGlobalKPIs");
        return this.getDefaultGlobalKPIs();
      }

      // Filter valid occurrences
      const validOccurrences = occurrences.filter(occ => occ != null);

      // Completion rate
      const completedOccurrences = validOccurrences.filter((o) => o?.status === "Completed").length;
      const completionRate =
        validOccurrences.length > 0 ? (completedOccurrences / validOccurrences.length) * 100 : 0;

      // Total time invested
      const occurrenceTime =
        validOccurrences
          .filter((o) => o?.timeConsumed)
          .reduce((sum, o) => sum + (o.timeConsumed || 0), 0) / 60; // Convert to hours

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

      const totalTimeInvested = occurrenceTime + eventTime;

      // Planning efficiency
      const efficiencyData = userEvents
        .filter((e) => e?.associatedOccurrenceId && e?.dedicatedTime)
        .map((e) => {
          const occ = validOccurrences.find((o) => o?.id === e.associatedOccurrenceId);
          if (!occ || !occ.timeConsumed || occ.timeConsumed === 0) return null;
          return e.dedicatedTime! / (occ.timeConsumed / 60);
        })
        .filter((x): x is number => x !== null && !isNaN(x) && isFinite(x));

      const planningEfficiency =
        efficiencyData.length > 0
          ? efficiencyData.reduce((a, b) => a + b, 0) / efficiencyData.length
          : null;

      // Workload
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

      const averageWorkload: WorkloadData = {
        hoursPerDay: dayHours,
        hoursPerWeek: weekHours,
      };

      // Importance balance - simplified approach
      const getTaskImportance = (occId: number): number => {
        const task = userTasks.find(t => 
          validOccurrences.some(o => o?.id === occId && o?.associatedTaskId === t?.id)
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

      const importanceBalance: ImportanceBalance = {
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

      // Urgency balance
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

      const urgencyBalance: UrgencyBalance = {
        earlyCompletionRate:
          completedWithTiming.length > 0 ? (earlyCount / completedWithTiming.length) * 100 : 0,
        onTimeCompletionRate:
          completedWithTiming.length > 0 ? (onTimeCount / completedWithTiming.length) * 100 : 0,
        lateCompletionRate:
          completedWithTiming.length > 0 ? (lateCount / completedWithTiming.length) * 100 : 0,
      };

      return {
        completionRate,
        totalTimeInvested,
        planningEfficiency,
        averageWorkload,
        importanceBalance,
        urgencyBalance,
      };
    } catch (error) {
      console.error("Error calculating global KPIs:", error);
      return this.getDefaultGlobalKPIs();
    }
  }

  /**
   * Get default global KPIs when data is unavailable
   */
  private getDefaultGlobalKPIs(): GlobalKPIs {
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

  /**
   * Calculate advanced insights
   */
  private async calculateInsights(dataset: UserDataset): Promise<AdvancedInsights> {
    const { tasks: userTasks, occurrences, recurrenceMap } = dataset;

    // Low compliance habits
    const habitTasks = userTasks.filter((t) => {
      if (!t.recurrenceId) return false;
      const rec = recurrenceMap.get(t.recurrenceId);
      return rec && (!rec.maxOccurrences || rec.maxOccurrences > 10);
    });

    const lowComplianceHabits: LowComplianceHabit[] = habitTasks
      .map((task) => {
        const taskOccs = occurrences.filter((o) => o.associatedTaskId === task.id);
        const completed = taskOccs.filter((o) => o.status === "Completed").length;
        const completionRate = taskOccs.length > 0 ? (completed / taskOccs.length) * 100 : 0;

        return {
          taskId: task.id,
          taskName: task.name,
          completionRate,
          totalOccurrences: taskOccs.length,
          completedOccurrences: completed,
        };
      })
      .filter((h) => h.completionRate < 70 && h.totalOccurrences >= 5)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);

    // Completion trend (by week)
    const trendByWeek = new Map<string, { completed: number; total: number }>();

    for (const occ of occurrences) {
      const date = new Date(occ.startDate);
      const weekKey = this.getWeekKey(date);

      if (!trendByWeek.has(weekKey)) {
        trendByWeek.set(weekKey, { completed: 0, total: 0 });
      }
      const week = trendByWeek.get(weekKey)!;
      week.total++;
      if (occ.status === "Completed") {
        week.completed++;
      }
    }

    const completionTrend: TrendPoint[] = Array.from(trendByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 weeks
      .map(([period, data]) => ({
        period,
        completionRate: (data.completed / data.total) * 100,
      }));

    // Recurring vs unique comparison
    const recurringTaskIds = new Set(userTasks.filter((t) => t.recurrenceId).map((t) => t.id));
    const recurringOccs = occurrences.filter((o) => recurringTaskIds.has(o.associatedTaskId));
    const uniqueOccs = occurrences.filter((o) => !recurringTaskIds.has(o.associatedTaskId));

    const recurringCompletionRate =
      recurringOccs.length > 0
        ? (recurringOccs.filter((o) => o.status === "Completed").length / recurringOccs.length) *
          100
        : 0;
    const uniqueCompletionRate =
      uniqueOccs.length > 0
        ? (uniqueOccs.filter((o) => o.status === "Completed").length / uniqueOccs.length) * 100
        : 0;

    // Bottlenecks
    const taskOccurrenceMap = new Map<number, any[]>();
    for (const occ of occurrences) {
      if (!taskOccurrenceMap.has(occ.associatedTaskId)) {
        taskOccurrenceMap.set(occ.associatedTaskId, []);
      }
      taskOccurrenceMap.get(occ.associatedTaskId)!.push(occ);
    }

    const bottlenecks: Bottleneck[] = Array.from(taskOccurrenceMap.entries())
      .map(([taskId, occs]) => {
        const task = userTasks.find((t) => t.id === taskId);
        if (!task) return null;

        const pending = occs.filter((o) => o.status === "Pending").length;
        const skipped = occs.filter((o) => o.status === "Skipped").length;

        return {
          taskId,
          taskName: task.name,
          pendingCount: pending,
          skippedCount: skipped,
          totalCount: occs.length,
        };
      })
      .filter((b): b is Bottleneck => b !== null && (b.pendingCount > 3 || b.skippedCount > 2))
      .sort((a, b) => b.pendingCount + b.skippedCount - (a.pendingCount + a.skippedCount))
      .slice(0, 5);

    return {
      lowComplianceHabits,
      completionTrend,
      recurringVsUniqueComparison: {
        recurringCompletionRate,
        uniqueCompletionRate,
      },
      bottlenecks,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNum = this.getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getDateFromWeekKey(weekKey: string): Date {
    const parts = weekKey.split("-W");
    const year = Number(parts[0]);
    const week = Number(parts[1]);

    if (isNaN(year) || isNaN(week)) {
      return new Date();
    }

    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const isoWeekStart = simple;
    if (dow <= 4) isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return isoWeekStart;
  }

  private calculateStreaks(compliance: HabitCompliancePoint[]): {
    maxStreak: number;
    currentStreak: number;
  } {
    if (compliance.length === 0) return { maxStreak: 0, currentStreak: 0 };

    let maxStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    // Sort by date
    const sorted = [...compliance].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i];
      if (point && point.completionRate === 100) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak from the end
    for (let i = sorted.length - 1; i >= 0; i--) {
      const point = sorted[i];
      if (point && point.completionRate === 100) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { maxStreak, currentStreak };
  }
}

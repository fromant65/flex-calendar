/**
 * Mock Statistics Data
 * Used for development and testing of the statistics page
 */

import type { AllStatistics } from "~/types";

export const mockStatsData: AllStatistics = {
  taskStats: {
    averageCompletionTime: 48.5, // 48.5 hours average
    importanceDistribution: [
      { importance: 1, completionRate: 45, totalOccurrences: 20, completedOccurrences: 9 },
      { importance: 2, completionRate: 52, totalOccurrences: 25, completedOccurrences: 13 },
      { importance: 3, completionRate: 58, totalOccurrences: 30, completedOccurrences: 17 },
      { importance: 4, completionRate: 65, totalOccurrences: 35, completedOccurrences: 23 },
      { importance: 5, completionRate: 70, totalOccurrences: 40, completedOccurrences: 28 },
      { importance: 6, completionRate: 75, totalOccurrences: 38, completedOccurrences: 29 },
      { importance: 7, completionRate: 80, totalOccurrences: 32, completedOccurrences: 26 },
      { importance: 8, completionRate: 85, totalOccurrences: 28, completedOccurrences: 24 },
      { importance: 9, completionRate: 90, totalOccurrences: 22, completedOccurrences: 20 },
      { importance: 10, completionRate: 95, totalOccurrences: 18, completedOccurrences: 17 },
    ],
    fixedVsFlexible: {
      fixed: 35,
      flexible: 65,
    },
    recurringVsUnique: {
      recurring: 45,
      unique: 55,
    },
  },
  recurrenceStats: {
    habitCompliance: [
      {
        date: new Date("2024-09-16"),
        completionRate: 75,
        completedOccurrences: 15,
        totalOccurrences: 20,
      },
      {
        date: new Date("2024-09-23"),
        completionRate: 80,
        completedOccurrences: 16,
        totalOccurrences: 20,
      },
      {
        date: new Date("2024-09-30"),
        completionRate: 70,
        completedOccurrences: 14,
        totalOccurrences: 20,
      },
      {
        date: new Date("2024-10-07"),
        completionRate: 85,
        completedOccurrences: 17,
        totalOccurrences: 20,
      },
      {
        date: new Date("2024-10-14"),
        completionRate: 90,
        completedOccurrences: 18,
        totalOccurrences: 20,
      },
    ],
    maxStreak: 12,
    currentStreak: 3,
    frequentDays: [
      { day: "Mon", completionCount: 45, completionRate: 78 },
      { day: "Tue", completionCount: 48, completionRate: 82 },
      { day: "Wed", completionCount: 52, completionRate: 86 },
      { day: "Thu", completionCount: 50, completionRate: 83 },
      { day: "Fri", completionCount: 42, completionRate: 75 },
      { day: "Sat", completionCount: 35, completionRate: 68 },
      { day: "Sun", completionCount: 30, completionRate: 62 },
    ],
  },
  occurrenceStats: {
    occurrencesByPeriod: [
      { period: "2024-W37", count: 45 },
      { period: "2024-W38", count: 52 },
      { period: "2024-W39", count: 48 },
      { period: "2024-W40", count: 55 },
      { period: "2024-W41", count: 60 },
      { period: "2024-W42", count: 58 },
    ],
    statusDistribution: {
      pending: 35,
      inProgress: 12,
      completed: 145,
      skipped: 8,
    },
    averageTimeDeviation: -0.5, // 30 minutes under planned time on average
    averageUrgency: 5.8,
    averageResolutionTime: 36.2, // 36.2 hours average
  },
  calendarStats: {
    completedVsIncomplete: {
      completed: 125,
      incomplete: 38,
    },
    hourlyDistribution: [
      { hour: 0, count: 0, completionRate: 0 },
      { hour: 1, count: 0, completionRate: 0 },
      { hour: 2, count: 0, completionRate: 0 },
      { hour: 3, count: 0, completionRate: 0 },
      { hour: 4, count: 0, completionRate: 0 },
      { hour: 5, count: 1, completionRate: 100 },
      { hour: 6, count: 3, completionRate: 100 },
      { hour: 7, count: 8, completionRate: 87.5 },
      { hour: 8, count: 12, completionRate: 91.7 },
      { hour: 9, count: 18, completionRate: 88.9 },
      { hour: 10, count: 22, completionRate: 86.4 },
      { hour: 11, count: 15, completionRate: 80 },
      { hour: 12, count: 10, completionRate: 70 },
      { hour: 13, count: 8, completionRate: 75 },
      { hour: 14, count: 20, completionRate: 85 },
      { hour: 15, count: 24, completionRate: 87.5 },
      { hour: 16, count: 18, completionRate: 83.3 },
      { hour: 17, count: 12, completionRate: 75 },
      { hour: 18, count: 8, completionRate: 62.5 },
      { hour: 19, count: 5, completionRate: 60 },
      { hour: 20, count: 3, completionRate: 66.7 },
      { hour: 21, count: 2, completionRate: 50 },
      { hour: 22, count: 1, completionRate: 0 },
      { hour: 23, count: 0, completionRate: 0 },
    ],
    complianceRate: 76.7,
  },
  globalKPIs: {
    completionRate: 72.5,
    totalTimeInvested: 456.8, // Total hours
    planningEfficiency: 1.12, // Slightly over-efficient (planned less than needed)
    averageWorkload: {
      hoursPerDay: 6.5,
      hoursPerWeek: 42.3,
    },
    importanceBalance: {
      lowImportanceCompletionRate: 51.7,
      mediumImportanceCompletionRate: 72.5,
      highImportanceCompletionRate: 90,
    },
    urgencyBalance: {
      earlyCompletionRate: 45,
      onTimeCompletionRate: 38,
      lateCompletionRate: 17,
    },
  },
  insights: {
    lowComplianceHabits: [
      {
        taskId: 1,
        taskName: "Meditar 10 minutos",
        completionRate: 45,
        totalOccurrences: 30,
        completedOccurrences: 14,
      },
      {
        taskId: 2,
        taskName: "Leer 30 páginas",
        completionRate: 52,
        totalOccurrences: 25,
        completedOccurrences: 13,
      },
      {
        taskId: 3,
        taskName: "Ejercicio matutino",
        completionRate: 58,
        totalOccurrences: 28,
        completedOccurrences: 16,
      },
    ],
    completionTrend: [
      { period: "2024-W30", completionRate: 65 },
      { period: "2024-W31", completionRate: 68 },
      { period: "2024-W32", completionRate: 70 },
      { period: "2024-W33", completionRate: 67 },
      { period: "2024-W34", completionRate: 72 },
      { period: "2024-W35", completionRate: 75 },
      { period: "2024-W36", completionRate: 73 },
      { period: "2024-W37", completionRate: 76 },
      { period: "2024-W38", completionRate: 78 },
      { period: "2024-W39", completionRate: 74 },
      { period: "2024-W40", completionRate: 77 },
      { period: "2024-W41", completionRate: 80 },
    ],
    recurringVsUniqueComparison: {
      recurringCompletionRate: 78.5,
      uniqueCompletionRate: 67.2,
    },
    bottlenecks: [
      {
        taskId: 4,
        taskName: "Revisar emails pendientes",
        pendingCount: 12,
        skippedCount: 5,
        totalCount: 25,
      },
      {
        taskId: 5,
        taskName: "Documentar proyecto X",
        pendingCount: 8,
        skippedCount: 3,
        totalCount: 15,
      },
    ],
  },
};

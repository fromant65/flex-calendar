/**
 * Stats Module - Exports all statistics-related services and calculators
 */

export { StatisticsService } from "./statistics.service";
export { TaskStatsCalculator } from "./task-stats-calculator";
export { RecurrenceStatsCalculator } from "./recurrence-stats-calculator";
export { OccurrenceStatsCalculator } from "./occurrence-stats-calculator";
export { CalendarStatsCalculator } from "./calendar-stats-calculator";
export { GlobalKPIsCalculator } from "./global-kpis-calculator";
export { AdvancedInsightsCalculator } from "./advanced-insights-calculator";
export { StatsUtils } from "./stats-utils";

// Urgency calculator is now centralized at utils/urgency-calculator.ts
// Import from there instead: import { UrgencyCalculator } from "../utils/urgency-calculator";

// Export types
export type {
  StatsDataset,
  StatsTask,
  StatsOccurrence,
  StatsEvent,
  StatsRecurrence,
} from "./stats-types";

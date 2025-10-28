/**
 * Services Module - Barrel Export
 * 
 * Centralized exports for all services organized by domain
 */

// Core orchestrator service (main facade)
export { TaskLifecycleService } from "./core";

// Domain-specific services
export { TaskManagementService } from "./tasks";
export { 
  OccurrenceManagementService,
  OccurrenceCompletionService,
  BacklogDetectionService 
} from "./occurrences";
export { 
  EventManagementService,
  EventCompletionService 
} from "./events";
export { 
  TaskSchedulerService,
  RecurrenceDateCalculator,
  PeriodManager,
  FixedTaskService,
  OccurrenceCreationService,
  OccurrencePreviewService 
} from "./scheduling";
export { TaskAnalyticsService } from "./analytics";

// Stats and Timeline services (separate modules)
export { TimelineService } from "./timeline.service";
export { StatisticsService } from "./stats/statistics.service";

// Types
export * from "./types";
export type { TaskSchedulerServiceInterface } from "./scheduling";

/**
 * Date Domain Module
 * 
 * Centralized date handling for the application.
 * Provides domain-driven design approach to date manipulation.
 */

// Main service (Facade)
export { DateDomainService } from './date-domain.service';

// Value Objects
export { EventTime, Deadline, PeriodStart, Timestamp } from './value-objects';

// Utilities
export { DateCalculator, DateComparator, DateFormatter } from './utils';

// Types
export type {
  DateInput,
  DateRange,
  PeriodInfo,
  DeadlineStatus,
  DateComponents,
  TimeComponents,
  DateTimeComponents,
  DurationComponents,
  DateFormatStyle,
  PeriodType,
} from './types';

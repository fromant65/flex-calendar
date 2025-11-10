/**
 * DateDomainService Basic Tests
 * 
 * Basic smoke tests to ensure the service works correctly
 */

import { describe, test, expect } from '@jest/globals';
import {
  DateDomainService,
  EventTime,
  Deadline,
  PeriodStart,
  Timestamp,
} from '../index';

describe('DateDomainService', () => {
  const service = new DateDomainService();

  describe('Factory Methods', () => {
    test('should create EventTime from "now"', () => {
      const eventTime = service.createEventTime('now');
      expect(eventTime).toBeInstanceOf(EventTime);
    });

    test('should create EventTime from Date', () => {
      const date = new Date('2025-11-10T15:00:00Z');
      const eventTime = service.createEventTime(date);
      expect(eventTime).toBeInstanceOf(EventTime);
    });

    test('should create EventTime from ISO string', () => {
      const eventTime = service.createEventTime('2025-11-10T15:00:00Z');
      expect(eventTime).toBeInstanceOf(EventTime);
      expect(eventTime.toISOString()).toBe('2025-11-10T15:00:00.000Z');
    });

    test('should create EventTime from components', () => {
      const eventTime = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 15,
        minute: 30,
      });
      expect(eventTime).toBeInstanceOf(EventTime);
    });

    test('should create Deadline from "today"', () => {
      const deadline = service.createDeadline('today');
      expect(deadline).toBeInstanceOf(Deadline);
      expect(deadline.isToday()).toBe(true);
    });

    test('should create Deadline from "tomorrow"', () => {
      const deadline = service.createDeadline('tomorrow');
      expect(deadline).toBeInstanceOf(Deadline);
      expect(deadline.daysUntil()).toBe(1);
    });

    test('should create Deadline from Date', () => {
      const date = new Date('2025-11-15');
      const deadline = service.createDeadline(date);
      expect(deadline).toBeInstanceOf(Deadline);
    });

    test('should create Deadline from components', () => {
      const deadline = service.createDeadline({
        year: 2025,
        month: 11,
        day: 15,
      });
      expect(deadline).toBeInstanceOf(Deadline);
    });

    test('should create PeriodStart', () => {
      const periodStart = service.createPeriodStart('today');
      expect(periodStart).toBeInstanceOf(PeriodStart);
    });

    test('should create Timestamp', () => {
      const timestamp = service.createTimestamp('now');
      expect(timestamp).toBeInstanceOf(Timestamp);
    });
  });

  describe('Calculations', () => {
    test('should calculate event duration', () => {
      const start = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 10,
        minute: 0,
      });
      const end = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 11,
        minute: 30,
      });

      const duration = service.calculateEventDuration(start, end);
      expect(duration.hours).toBe(1.5);
      expect(duration.minutes).toBe(90);
    });

    test('should calculate days between deadlines', () => {
      const start = service.createDeadline({ year: 2025, month: 11, day: 10 });
      const end = service.createDeadline({ year: 2025, month: 11, day: 15 });

      const days = service.calculateDaysBetween(start, end);
      expect(days).toBe(5);
    });

    test('should add days to deadline', () => {
      const deadline = service.createDeadline({ year: 2025, month: 11, day: 10 });
      const newDeadline = service.addDays(deadline, 5);

      const components = newDeadline.getComponents();
      expect(components.day).toBe(15);
    });

    test('should add months to deadline', () => {
      const deadline = service.createDeadline({ year: 2025, month: 11, day: 10 });
      const newDeadline = service.addMonths(deadline, 2);

      const components = newDeadline.getComponents();
      expect(components.month).toBe(1);
      expect(components.year).toBe(2026);
    });
  });

  describe('Comparisons', () => {
    test('should compare event times', () => {
      const time1 = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 10,
        minute: 0,
      });
      const time2 = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 11,
        minute: 0,
      });

      expect(time1.isBefore(time2)).toBe(true);
      expect(time2.isAfter(time1)).toBe(true);
    });

    test('should sort deadlines', () => {
      const deadline1 = service.createDeadline({ year: 2025, month: 11, day: 15 });
      const deadline2 = service.createDeadline({ year: 2025, month: 11, day: 10 });
      const deadline3 = service.createDeadline({ year: 2025, month: 11, day: 12 });

      const sorted = service.sortDeadlines([deadline1, deadline2, deadline3]);

      expect(sorted[0]!.getComponents().day).toBe(10);
      expect(sorted[1]!.getComponents().day).toBe(12);
      expect(sorted[2]!.getComponents().day).toBe(15);
    });

    test('should find earliest and latest deadlines', () => {
      const deadline1 = service.createDeadline({ year: 2025, month: 11, day: 15 });
      const deadline2 = service.createDeadline({ year: 2025, month: 11, day: 10 });
      const deadline3 = service.createDeadline({ year: 2025, month: 11, day: 12 });

      const earliest = service.findEarliestDeadline(deadline1, deadline2, deadline3);
      const latest = service.findLatestDeadline(deadline1, deadline2, deadline3);

      expect(earliest.getComponents().day).toBe(10);
      expect(latest.getComponents().day).toBe(15);
    });
  });

  describe('Formatting', () => {
    test('should format event time', () => {
      const eventTime = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 15,
        minute: 30,
      });

      const formatted = service.formatEventTime(eventTime, 'medium');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('should format deadline', () => {
      const deadline = service.createDeadline({ year: 2025, month: 11, day: 10 });

      const formatted = service.formatDeadline(deadline, 'short');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('should format duration', () => {
      const milliseconds = 1000 * 60 * 90; // 90 minutes
      const formatted = service.formatDuration(milliseconds);
      expect(formatted).toBe('1h 30m');
    });

    test('should format duration long', () => {
      const milliseconds = 1000 * 60 * 90; // 90 minutes
      const formatted = service.formatDurationLong(milliseconds);
      expect(formatted).toContain('hora');
      expect(formatted).toContain('minuto');
    });

    test('should format deadline relative', () => {
      const today = service.today();
      const tomorrow = service.tomorrow();

      expect(service.formatDeadlineRelative(today)).toBe('Hoy');
      expect(service.formatDeadlineRelative(tomorrow)).toBe('Mañana');
    });
  });

  describe('Validation', () => {
    test('should validate event time range', () => {
      const start = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 10,
        minute: 0,
      });
      const end = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 11,
        minute: 0,
      });

      const validation = service.validateEventTimeRange(start, end);
      expect(validation.valid).toBe(true);
    });

    test('should invalidate reversed event time range', () => {
      const start = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 11,
        minute: 0,
      });
      const end = service.createEventTime({
        year: 2025,
        month: 11,
        day: 10,
        hour: 10,
        minute: 0,
      });

      const validation = service.validateEventTimeRange(start, end);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeTruthy();
    });
  });

  describe('Period Management', () => {
    test('should calculate next period for interval type', () => {
      const periodStart = service.createPeriodStart({ year: 2025, month: 11, day: 10 });
      const nextPeriod = service.calculateNextPeriod(periodStart, 'interval', 7);

      const components = nextPeriod.getComponents();
      expect(components.day).toBe(17);
    });

    test('should calculate next period for weekly type', () => {
      const periodStart = service.createPeriodStart({ year: 2025, month: 11, day: 10 });
      const nextPeriod = service.calculateNextPeriod(periodStart, 'weekly');

      const components = nextPeriod.getComponents();
      expect(components.day).toBe(17);
    });

    test('should calculate next period for monthly type', () => {
      const periodStart = service.createPeriodStart({ year: 2025, month: 11, day: 10 });
      const nextPeriod = service.calculateNextPeriod(periodStart, 'monthly');

      const components = nextPeriod.getComponents();
      expect(components.month).toBe(12);
      expect(components.day).toBe(1);
    });

    test('should calculate period end', () => {
      const periodStart = service.createPeriodStart({ year: 2025, month: 11, day: 10 });
      const periodEnd = service.calculatePeriodEnd(periodStart, 'interval', 7);

      const components = periodEnd.getComponents();
      expect(components.day).toBe(17);
    });
  });

  describe('Convenience Methods', () => {
    test('should get today', () => {
      const today = service.today();
      expect(today.isToday()).toBe(true);
    });

    test('should get tomorrow', () => {
      const tomorrow = service.tomorrow();
      expect(tomorrow.daysUntil()).toBe(1);
    });

    test('should get now', () => {
      const now = service.now();
      expect(now).toBeInstanceOf(Timestamp);
    });

    test('should convert Date to domain objects', () => {
      const date = new Date('2025-11-10T15:00:00Z');

      const eventTime = service.dateToEventTime(date);
      const deadline = service.dateToDeadline(date);
      const timestamp = service.dateToTimestamp(date);
      const periodStart = service.dateToPeriodStart(date);

      expect(eventTime).toBeInstanceOf(EventTime);
      expect(deadline).toBeInstanceOf(Deadline);
      expect(timestamp).toBeInstanceOf(Timestamp);
      expect(periodStart).toBeInstanceOf(PeriodStart);
    });
  });
});

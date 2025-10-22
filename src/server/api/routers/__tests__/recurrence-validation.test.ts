/**
 * Tests for Recurrence Type Validation
 * Verifies that recurrence cannot mix interval, daysOfWeek, and daysOfMonth
 */

import { z } from "zod";

// Copy of the validation schema from task.router.ts
const createRecurrenceSchema = z.object({
  interval: z.number().positive().optional(),
  daysOfWeek: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).optional(),
  daysOfMonth: z.array(z.number().min(1).max(31)).optional(),
  maxOccurrences: z.number().positive().optional(),
  lastPeriodStart: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    const hasInterval = data.interval !== undefined && data.interval !== null;
    const hasDaysOfWeek = data.daysOfWeek !== undefined && data.daysOfWeek !== null && data.daysOfWeek.length > 0;
    const hasDaysOfMonth = data.daysOfMonth !== undefined && data.daysOfMonth !== null && data.daysOfMonth.length > 0;
    
    const typesCount = [hasInterval, hasDaysOfWeek, hasDaysOfMonth].filter(Boolean).length;
    return typesCount === 1;
  },
  {
    message: "Recurrence must have exactly one type: interval, daysOfWeek, or daysOfMonth (cannot mix types)",
  }
);

describe('Recurrence Type Validation', () => {
  describe('Valid recurrence types', () => {
    it('should accept interval-based recurrence', () => {
      const data = {
        interval: 7,
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept daysOfWeek recurrence', () => {
      const data = {
        daysOfWeek: ["Mon", "Wed", "Fri"] as const,
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept daysOfMonth recurrence', () => {
      const data = {
        daysOfMonth: [1, 15, 30],
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid recurrence type combinations', () => {
    it('should reject interval + daysOfWeek', () => {
      const data = {
        interval: 7,
        daysOfWeek: ["Mon", "Wed"] as const,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("cannot mix types");
      }
    });

    it('should reject interval + daysOfMonth', () => {
      const data = {
        interval: 7,
        daysOfMonth: [1, 15],
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("cannot mix types");
      }
    });

    it('should reject daysOfWeek + daysOfMonth', () => {
      const data = {
        daysOfWeek: ["Mon"] as const,
        daysOfMonth: [1],
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("cannot mix types");
      }
    });

    it('should reject all three types together', () => {
      const data = {
        interval: 7,
        daysOfWeek: ["Mon"] as const,
        daysOfMonth: [1],
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("cannot mix types");
      }
    });

    it('should reject recurrence with no type specified', () => {
      const data = {
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("cannot mix types");
      }
    });

    it('should reject empty daysOfWeek array (no type)', () => {
      const data = {
        daysOfWeek: [],
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty daysOfMonth array (no type)', () => {
      const data = {
        daysOfMonth: [],
        maxOccurrences: 3,
      };

      const result = createRecurrenceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

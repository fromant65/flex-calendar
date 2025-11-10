# Diseño de Arquitectura: Date Domain Service

**Versión:** 1.0  
**Fecha:** 10 de Noviembre de 2025  
**Estado:** Diseño Propuesto

---

## 🎯 Objetivos

1. **Centralizar** toda la lógica de manipulación de fechas en un servicio de dominio
2. **Estandarizar** el manejo de timezones (UTC en backend, conversión controlada)
3. **Eliminar duplicación** de código de fechas
4. **Proveer semántica** de dominio clara (EventTime vs Deadline vs Timestamp)
5. **Simplificar frontend** removiendo lógica de normalización de fechas

---

## 🏗️ Arquitectura Propuesta

### Estructura de Directorios

```
src/server/api/services/domain/
├── date-domain.service.ts           # ⭐ Servicio principal (Facade)
├── value-objects/
│   ├── event-time.vo.ts             # Fecha + Hora específica (eventos)
│   ├── deadline.vo.ts               # Solo fecha (deadlines)
│   ├── period-start.vo.ts           # Inicio de período (hábitos)
│   ├── timestamp.vo.ts              # Momento exacto (auditoría)
│   └── index.ts                     # Exports
├── types/
│   ├── date-domain.types.ts         # Interfaces y tipos
│   └── index.ts
└── utils/
    ├── date-calculator.ts           # Cálculos (diferencias, sumas)
    ├── date-comparator.ts           # Comparaciones y ordenamiento
    ├── date-formatter.ts            # Formateo para display
    └── index.ts
```

---

## 📦 Value Objects (VOs)

### 1. EventTime VO

**Propósito:** Representa una fecha-hora específica para eventos del calendario

**Características:**
- Almacena internamente en UTC
- Convierte desde/hacia timezone del usuario
- Preserva información de hora exacta

```typescript
/**
 * EventTime - Represents a specific date and time for calendar events
 * Internally stored in UTC, converts to/from user timezone
 */
export class EventTime {
  private readonly utcDate: Date;

  private constructor(utcDate: Date) {
    this.utcDate = utcDate;
  }

  /**
   * Create from user's local date-time
   * @param localDateTime Date in user's timezone
   */
  static fromLocal(localDateTime: Date): EventTime {
    return new EventTime(new Date(localDateTime.toISOString()));
  }

  /**
   * Create from UTC ISO string (from database)
   * @param isoString ISO 8601 string in UTC
   */
  static fromUTC(isoString: string): EventTime {
    return new EventTime(new Date(isoString));
  }

  /**
   * Create from date and time components in user timezone
   */
  static fromComponents(
    year: number,
    month: number, // 1-12
    day: number,
    hour: number,
    minute: number,
    timezoneOffsetMinutes?: number
  ): EventTime {
    // Create date in UTC
    const date = new Date(Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0
    ));
    
    // Adjust for timezone if provided
    if (timezoneOffsetMinutes !== undefined) {
      date.setUTCMinutes(date.getUTCMinutes() - timezoneOffsetMinutes);
    }
    
    return new EventTime(date);
  }

  /**
   * Get as Date object in UTC
   */
  toUTC(): Date {
    return new Date(this.utcDate);
  }

  /**
   * Get as ISO string for database storage
   */
  toISOString(): string {
    return this.utcDate.toISOString();
  }

  /**
   * Get as Date object in user's local timezone
   */
  toLocal(): Date {
    return new Date(this.utcDate.getTime());
  }

  /**
   * Format for display in user's locale
   */
  format(locale: string = 'es-AR', options?: Intl.DateTimeFormatOptions): string {
    return this.toLocal().toLocaleString(locale, options);
  }

  /**
   * Get timestamp in milliseconds
   */
  getTime(): number {
    return this.utcDate.getTime();
  }

  /**
   * Check if this time is before another
   */
  isBefore(other: EventTime): boolean {
    return this.utcDate < other.utcDate;
  }

  /**
   * Check if this time is after another
   */
  isAfter(other: EventTime): boolean {
    return this.utcDate > other.utcDate;
  }

  /**
   * Get difference in milliseconds
   */
  diff(other: EventTime): number {
    return this.getTime() - other.getTime();
  }
}
```

### 2. Deadline VO

**Propósito:** Representa una fecha límite donde solo importa el día, no la hora

**Características:**
- Almacena solo el día (sin hora)
- Siempre a medianoche UTC
- Comparaciones por día completo

```typescript
/**
 * Deadline - Represents a date where only the day matters, not the time
 * Stored at midnight UTC for consistency
 */
export class Deadline {
  private readonly utcMidnight: Date;

  private constructor(utcMidnight: Date) {
    this.utcMidnight = utcMidnight;
  }

  /**
   * Create from a date (extracts year, month, day only)
   */
  static fromDate(date: Date): Deadline {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    return new Deadline(utcMidnight);
  }

  /**
   * Create from UTC ISO string (from database)
   */
  static fromUTC(isoString: string): Deadline {
    return Deadline.fromDate(new Date(isoString));
  }

  /**
   * Create from date components
   */
  static fromComponents(year: number, month: number, day: number): Deadline {
    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    return new Deadline(utcMidnight);
  }

  /**
   * Create deadline for today
   */
  static today(): Deadline {
    return Deadline.fromDate(new Date());
  }

  /**
   * Create deadline for tomorrow
   */
  static tomorrow(): Deadline {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return Deadline.fromDate(tomorrow);
  }

  /**
   * Create deadline N days from now
   */
  static daysFromNow(days: number): Deadline {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return Deadline.fromDate(future);
  }

  /**
   * Get as Date at midnight UTC
   */
  toUTC(): Date {
    return new Date(this.utcMidnight);
  }

  /**
   * Get as ISO string for database
   */
  toISOString(): string {
    return this.utcMidnight.toISOString();
  }

  /**
   * Format for display (only date, no time)
   */
  format(locale: string = 'es-AR'): string {
    return this.utcMidnight.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  /**
   * Format short (dd MMM yyyy)
   */
  formatShort(locale: string = 'es-AR'): string {
    return this.utcMidnight.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  /**
   * Check if this deadline is before another
   */
  isBefore(other: Deadline): boolean {
    return this.utcMidnight < other.utcMidnight;
  }

  /**
   * Check if this deadline is after another
   */
  isAfter(other: Deadline): boolean {
    return this.utcMidnight > other.utcMidnight;
  }

  /**
   * Check if this deadline is today
   */
  isToday(): boolean {
    return this.equals(Deadline.today());
  }

  /**
   * Check if this deadline is in the past
   */
  isPast(): boolean {
    return this.isBefore(Deadline.today());
  }

  /**
   * Check if this deadline is in the future
   */
  isFuture(): boolean {
    return this.isAfter(Deadline.today());
  }

  /**
   * Check equality with another deadline
   */
  equals(other: Deadline): boolean {
    return this.utcMidnight.getTime() === other.utcMidnight.getTime();
  }

  /**
   * Get days until this deadline (negative if past)
   */
  daysUntil(): number {
    const today = Deadline.today();
    const diffMs = this.utcMidnight.getTime() - today.utcMidnight.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Add days to this deadline
   */
  addDays(days: number): Deadline {
    const newDate = new Date(this.utcMidnight);
    newDate.setUTCDate(newDate.getUTCDate() + days);
    return new Deadline(newDate);
  }

  /**
   * Get year, month, day components
   */
  getComponents(): { year: number; month: number; day: number } {
    return {
      year: this.utcMidnight.getUTCFullYear(),
      month: this.utcMidnight.getUTCMonth() + 1,
      day: this.utcMidnight.getUTCDate(),
    };
  }
}
```

### 3. PeriodStart VO

**Propósito:** Marca el inicio de un período para hábitos y tareas recurrentes

**Características:**
- Similar a Deadline pero con semántica de "período"
- Usado para cálculos de recurrencia
- Métodos específicos para avanzar períodos

```typescript
/**
 * PeriodStart - Marks the start of a period for recurring tasks/habits
 * Used for period-based calculations
 */
export class PeriodStart {
  private readonly deadline: Deadline;

  private constructor(deadline: Deadline) {
    this.deadline = deadline;
  }

  static fromDate(date: Date): PeriodStart {
    return new PeriodStart(Deadline.fromDate(date));
  }

  static fromUTC(isoString: string): PeriodStart {
    return new PeriodStart(Deadline.fromUTC(isoString));
  }

  static today(): PeriodStart {
    return new PeriodStart(Deadline.today());
  }

  /**
   * Calculate next period start based on interval
   */
  nextPeriod(intervalDays: number): PeriodStart {
    return new PeriodStart(this.deadline.addDays(intervalDays));
  }

  /**
   * Calculate next week period start
   */
  nextWeek(): PeriodStart {
    return new PeriodStart(this.deadline.addDays(7));
  }

  /**
   * Calculate next month period start
   */
  nextMonth(): PeriodStart {
    const { year, month } = this.deadline.getComponents();
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    return new PeriodStart(Deadline.fromComponents(nextYear, nextMonth, 1));
  }

  /**
   * Calculate period end based on interval
   */
  periodEnd(intervalDays: number): Deadline {
    return this.deadline.addDays(intervalDays);
  }

  /**
   * Check if a date is within this period
   */
  isInPeriod(date: Date, intervalDays: number): boolean {
    const deadline = Deadline.fromDate(date);
    const periodEnd = this.periodEnd(intervalDays);
    return !deadline.isBefore(this.deadline) && deadline.isBefore(periodEnd);
  }

  toUTC(): Date {
    return this.deadline.toUTC();
  }

  toISOString(): string {
    return this.deadline.toISOString();
  }

  format(locale?: string): string {
    return this.deadline.format(locale);
  }
}
```

### 4. Timestamp VO

**Propósito:** Representa un momento exacto en el tiempo (para auditoría)

**Características:**
- Momento preciso con milisegundos
- Usado para createdAt, updatedAt, completedAt
- Inmutable

```typescript
/**
 * Timestamp - Represents an exact moment in time
 * Used for audit fields (createdAt, updatedAt, completedAt)
 */
export class Timestamp {
  private readonly date: Date;

  private constructor(date: Date) {
    this.date = new Date(date); // Clone to ensure immutability
  }

  /**
   * Create timestamp for now
   */
  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  /**
   * Create from Date object
   */
  static fromDate(date: Date): Timestamp {
    return new Timestamp(date);
  }

  /**
   * Create from UTC ISO string
   */
  static fromUTC(isoString: string): Timestamp {
    return new Timestamp(new Date(isoString));
  }

  /**
   * Create from milliseconds since epoch
   */
  static fromMillis(millis: number): Timestamp {
    return new Timestamp(new Date(millis));
  }

  /**
   * Get as Date object
   */
  toDate(): Date {
    return new Date(this.date);
  }

  /**
   * Get as ISO string
   */
  toISOString(): string {
    return this.date.toISOString();
  }

  /**
   * Get milliseconds since epoch
   */
  getTime(): number {
    return this.date.getTime();
  }

  /**
   * Format for display
   */
  format(locale: string = 'es-AR', options?: Intl.DateTimeFormatOptions): string {
    return this.date.toLocaleString(locale, options);
  }

  /**
   * Check if before another timestamp
   */
  isBefore(other: Timestamp): boolean {
    return this.date < other.date;
  }

  /**
   * Check if after another timestamp
   */
  isAfter(other: Timestamp): boolean {
    return this.date > other.date;
  }

  /**
   * Get difference in milliseconds
   */
  diff(other: Timestamp): number {
    return this.getTime() - other.getTime();
  }

  /**
   * Get difference in seconds
   */
  diffSeconds(other: Timestamp): number {
    return Math.floor(this.diff(other) / 1000);
  }

  /**
   * Get difference in minutes
   */
  diffMinutes(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60));
  }

  /**
   * Get difference in hours
   */
  diffHours(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60 * 60));
  }

  /**
   * Get difference in days
   */
  diffDays(other: Timestamp): number {
    return Math.floor(this.diff(other) / (1000 * 60 * 60 * 24));
  }
}
```

---

## 🛠️ Utility Classes

### DateCalculator

**Propósito:** Cálculos matemáticos con fechas

```typescript
/**
 * DateCalculator - Utility for date calculations
 */
export class DateCalculator {
  /**
   * Calculate duration between two EventTimes
   */
  static duration(start: EventTime, end: EventTime): {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
  } {
    const ms = end.diff(start);
    return {
      milliseconds: ms,
      seconds: Math.floor(ms / 1000),
      minutes: Math.floor(ms / (1000 * 60)),
      hours: ms / (1000 * 60 * 60),
    };
  }

  /**
   * Calculate days between two deadlines
   */
  static daysBetween(start: Deadline, end: Deadline): number {
    return end.daysUntil() - start.daysUntil();
  }

  /**
   * Add interval to deadline
   */
  static addDays(deadline: Deadline, days: number): Deadline {
    return deadline.addDays(days);
  }

  /**
   * Add months to deadline
   */
  static addMonths(deadline: Deadline, months: number): Deadline {
    const components = deadline.getComponents();
    let { year, month, day } = components;
    
    month += months;
    while (month > 12) {
      month -= 12;
      year += 1;
    }
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    
    // Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      day = daysInMonth;
    }
    
    return Deadline.fromComponents(year, month, day);
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  static getDayOfWeek(deadline: Deadline): number {
    return deadline.toUTC().getUTCDay();
  }

  /**
   * Get day of month (1-31)
   */
  static getDayOfMonth(deadline: Deadline): number {
    return deadline.getComponents().day;
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get days in month
   */
  static daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
}
```

### DateComparator

**Propósito:** Comparaciones y ordenamiento

```typescript
/**
 * DateComparator - Utility for comparing and sorting dates
 */
export class DateComparator {
  /**
   * Compare two EventTimes (for sorting)
   * Returns: -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compareEventTimes(a: EventTime, b: EventTime): number {
    const diff = a.getTime() - b.getTime();
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  /**
   * Compare two Deadlines
   */
  static compareDeadlines(a: Deadline, b: Deadline): number {
    if (a.isBefore(b)) return -1;
    if (a.isAfter(b)) return 1;
    return 0;
  }

  /**
   * Compare two Timestamps
   */
  static compareTimestamps(a: Timestamp, b: Timestamp): number {
    const diff = a.getTime() - b.getTime();
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  /**
   * Sort array of EventTimes (ascending)
   */
  static sortEventTimes(times: EventTime[]): EventTime[] {
    return [...times].sort(this.compareEventTimes);
  }

  /**
   * Sort array of Deadlines (ascending)
   */
  static sortDeadlines(deadlines: Deadline[]): Deadline[] {
    return [...deadlines].sort(this.compareDeadlines);
  }

  /**
   * Find earliest EventTime
   */
  static earliest(...times: EventTime[]): EventTime {
    if (times.length === 0) throw new Error('No times provided');
    return times.reduce((earliest, current) =>
      current.isBefore(earliest) ? current : earliest
    );
  }

  /**
   * Find latest EventTime
   */
  static latest(...times: EventTime[]): EventTime {
    if (times.length === 0) throw new Error('No times provided');
    return times.reduce((latest, current) =>
      current.isAfter(latest) ? current : latest
    );
  }
}
```

### DateFormatter

**Propósito:** Formateo consistente para display

```typescript
/**
 * DateFormatter - Utility for consistent date formatting
 */
export class DateFormatter {
  private static readonly DEFAULT_LOCALE = 'es-AR';

  /**
   * Format EventTime for display
   */
  static formatEventTime(
    time: EventTime,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      short: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
      medium: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      },
    }[format];

    return time.format(locale, options);
  }

  /**
   * Format Deadline for display
   */
  static formatDeadline(
    deadline: Deadline,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    if (format === 'short') {
      return deadline.formatShort(locale);
    }
    return deadline.format(locale);
  }

  /**
   * Format Deadline with relative time (e.g., "Mañana", "En 3 días")
   */
  static formatDeadlineRelative(
    deadline: Deadline,
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const days = deadline.daysUntil();

    if (days < 0) {
      return `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Mañana';
    } else if (days <= 7) {
      return `En ${days} días`;
    } else {
      return deadline.format(locale);
    }
  }

  /**
   * Format Timestamp
   */
  static formatTimestamp(
    timestamp: Timestamp,
    format: 'short' | 'medium' | 'long' = 'medium',
    locale: string = this.DEFAULT_LOCALE
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      short: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
      medium: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
    }[format];

    return timestamp.format(locale, options);
  }

  /**
   * Format duration in human-readable form
   */
  static formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
```

---

## 🎭 Date Domain Service (Facade)

**Propósito:** Punto de entrada único para todas las operaciones de fechas

```typescript
/**
 * DateDomainService - Facade for all date operations
 * 
 * This service provides a unified interface for date manipulation across the application.
 * It coordinates between value objects and utilities to provide high-level operations.
 */
export class DateDomainService {
  // ==================== Factory Methods ====================

  /**
   * Create EventTime from various inputs
   */
  createEventTime(input: Date | string | { year: number; month: number; day: number; hour: number; minute: number }): EventTime {
    if (input instanceof Date) {
      return EventTime.fromLocal(input);
    } else if (typeof input === 'string') {
      return EventTime.fromUTC(input);
    } else {
      return EventTime.fromComponents(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute
      );
    }
  }

  /**
   * Create Deadline from various inputs
   */
  createDeadline(input: Date | string | { year: number; month: number; day: number } | 'today' | 'tomorrow'): Deadline {
    if (input === 'today') {
      return Deadline.today();
    } else if (input === 'tomorrow') {
      return Deadline.tomorrow();
    } else if (input instanceof Date) {
      return Deadline.fromDate(input);
    } else if (typeof input === 'string') {
      return Deadline.fromUTC(input);
    } else {
      return Deadline.fromComponents(input.year, input.month, input.day);
    }
  }

  /**
   * Create PeriodStart
   */
  createPeriodStart(input: Date | string | 'today'): PeriodStart {
    if (input === 'today') {
      return PeriodStart.today();
    } else if (input instanceof Date) {
      return PeriodStart.fromDate(input);
    } else {
      return PeriodStart.fromUTC(input);
    }
  }

  /**
   * Create Timestamp
   */
  createTimestamp(input?: Date | string | 'now'): Timestamp {
    if (!input || input === 'now') {
      return Timestamp.now();
    } else if (input instanceof Date) {
      return Timestamp.fromDate(input);
    } else {
      return Timestamp.fromUTC(input);
    }
  }

  // ==================== Calculations ====================

  /**
   * Calculate event duration
   */
  calculateEventDuration(start: EventTime, end: EventTime) {
    return DateCalculator.duration(start, end);
  }

  /**
   * Calculate days between deadlines
   */
  calculateDaysBetween(start: Deadline, end: Deadline): number {
    return DateCalculator.daysBetween(start, end);
  }

  /**
   * Add days to deadline
   */
  addDays(deadline: Deadline, days: number): Deadline {
    return DateCalculator.addDays(deadline, days);
  }

  /**
   * Add months to deadline
   */
  addMonths(deadline: Deadline, months: number): Deadline {
    return DateCalculator.addMonths(deadline, months);
  }

  // ==================== Comparisons ====================

  /**
   * Sort event times
   */
  sortEventTimes(times: EventTime[]): EventTime[] {
    return DateComparator.sortEventTimes(times);
  }

  /**
   * Sort deadlines
   */
  sortDeadlines(deadlines: Deadline[]): Deadline[] {
    return DateComparator.sortDeadlines(deadlines);
  }

  /**
   * Find earliest event time
   */
  findEarliest(...times: EventTime[]): EventTime {
    return DateComparator.earliest(...times);
  }

  /**
   * Find latest event time
   */
  findLatest(...times: EventTime[]): EventTime {
    return DateComparator.latest(...times);
  }

  // ==================== Formatting ====================

  /**
   * Format event time for display
   */
  formatEventTime(time: EventTime, format?: 'short' | 'medium' | 'long'): string {
    return DateFormatter.formatEventTime(time, format);
  }

  /**
   * Format deadline for display
   */
  formatDeadline(deadline: Deadline, format?: 'short' | 'medium' | 'long'): string {
    return DateFormatter.formatDeadline(deadline, format);
  }

  /**
   * Format deadline with relative time
   */
  formatDeadlineRelative(deadline: Deadline): string {
    return DateFormatter.formatDeadlineRelative(deadline);
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: Timestamp, format?: 'short' | 'medium' | 'long'): string {
    return DateFormatter.formatTimestamp(timestamp, format);
  }

  /**
   * Format duration
   */
  formatDuration(milliseconds: number): string {
    return DateFormatter.formatDuration(milliseconds);
  }

  // ==================== Validation ====================

  /**
   * Validate that end time is after start time
   */
  validateEventTimeRange(start: EventTime, end: EventTime): { valid: boolean; error?: string } {
    if (!start.isBefore(end)) {
      return {
        valid: false,
        error: 'End time must be after start time',
      };
    }
    return { valid: true };
  }

  /**
   * Validate that deadline is in the future
   */
  validateDeadlineInFuture(deadline: Deadline): { valid: boolean; error?: string } {
    if (deadline.isPast()) {
      return {
        valid: false,
        error: 'Deadline must be in the future',
      };
    }
    return { valid: true };
  }

  // ==================== Period Management ====================

  /**
   * Calculate next period start
   */
  calculateNextPeriod(
    currentPeriod: PeriodStart,
    type: 'interval' | 'weekly' | 'monthly',
    intervalDays?: number
  ): PeriodStart {
    switch (type) {
      case 'interval':
        if (!intervalDays) throw new Error('Interval days required');
        return currentPeriod.nextPeriod(intervalDays);
      case 'weekly':
        return currentPeriod.nextWeek();
      case 'monthly':
        return currentPeriod.nextMonth();
    }
  }

  /**
   * Check if date is in current period
   */
  isInPeriod(date: Date, periodStart: PeriodStart, intervalDays: number): boolean {
    return periodStart.isInPeriod(date, intervalDays);
  }
}
```

---

## 📋 Types & Interfaces

```typescript
/**
 * Date domain types
 */

export type DateInput = Date | string | number;

export interface DateRange {
  start: Deadline;
  end: Deadline;
}

export interface EventTimeRange {
  start: EventTime;
  end: EventTime;
}

export interface PeriodInfo {
  start: PeriodStart;
  end: Deadline;
  intervalDays: number;
}

export interface DeadlineStatus {
  deadline: Deadline;
  daysUntil: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  urgencyLevel: 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later';
}
```

---

## 🔄 Migration Strategy

### Phase 1: Create Domain Service (Week 1)
1. ✅ Create directory structure
2. ✅ Implement Value Objects
3. ✅ Implement Utility classes
4. ✅ Implement DateDomainService
5. ✅ Write unit tests for all VOs and utilities

### Phase 2: Migrate Backend Services (Week 2-3)
1. Start with scheduling services (highest UTC usage)
   - `recurrence-date-calculator.service.ts`
   - `period-manager.service.ts`
   - `occurrence-creation.service.ts`
2. Migrate analytics services
   - `task-streak.service.ts`
   - `stats-utils.ts`
3. Migrate completion services
   - `event-completion.service.ts`
   - `occurrence-completion.service.ts`
4. Migrate backlog detection
   - `backlog-detection.service.ts`

### Phase 3: Update Routers (Week 3)
1. Update input validation to use domain types
2. Add conversion layers where needed
3. Ensure backward compatibility

### Phase 4: Simplify Frontend (Week 4)
1. Remove `normalizeDateForDisplay()` from frontend
2. Backend sends properly formatted dates
3. Frontend only does display formatting
4. Update components to use simplified date handling

### Phase 5: Testing & Validation (Week 5)
1. Run full test suite
2. Test in multiple timezones (UTC-3, UTC+0, UTC+5)
3. Validate with QA team
4. Monitor in production

---

## ✅ Success Criteria

1. **Zero** `normalizeDateForDisplay()` calls in frontend
2. **All** date calculations use `DateDomainService`
3. **All** UTC conversions are explicit and documented
4. **100%** test coverage for domain service
5. **Zero** date-related bugs in different timezones
6. **50%** reduction in date manipulation code

---

## 📚 Examples

### Example 1: Creating a Calendar Event

**Before:**
```typescript
// Frontend
const start = new Date(year, month, day, startHour, startMinute);
const finish = new Date(year, month, day, endHour, endMinute);

// Backend (implicit UTC conversion)
await db.insert(calendarEvents).values({
  start,  // Stored as UTC
  finish,
});
```

**After:**
```typescript
// Frontend
const eventData = {
  year, month, day,
  startHour, startMinute,
  endHour, endMinute,
};

// Backend
const dateDomain = new DateDomainService();
const start = dateDomain.createEventTime({
  year: eventData.year,
  month: eventData.month,
  day: eventData.day,
  hour: eventData.startHour,
  minute: eventData.startMinute,
});
const finish = dateDomain.createEventTime({
  year: eventData.year,
  month: eventData.month,
  day: eventData.day,
  hour: eventData.endHour,
  minute: eventData.endMinute,
});

await db.insert(calendarEvents).values({
  start: start.toISOString(),
  finish: finish.toISOString(),
});
```

### Example 2: Creating a Deadline

**Before:**
```typescript
// Frontend
const limitDate = new Date(formData.limitDate + "T12:00:00");

// Backend
await db.insert(taskOccurrences).values({
  limitDate,  // Stored with arbitrary time
});

// Display (needs normalization)
const normalized = normalizeDateForDisplay(occurrence.limitDate);
```

**After:**
```typescript
// Frontend
const limitDateString = formData.limitDate; // "2025-11-15"

// Backend
const dateDomain = new DateDomainService();
const [year, month, day] = limitDateString.split('-').map(Number);
const limitDate = dateDomain.createDeadline({ year, month, day });

await db.insert(taskOccurrences).values({
  limitDate: limitDate.toISOString(),  // Stored at midnight UTC
});

// Display (no normalization needed)
const formatted = dateDomain.formatDeadline(limitDate);
```

### Example 3: Calculating Period

**Before:**
```typescript
// Scattered UTC logic
const periodEnd = new Date(periodStart);
periodEnd.setUTCDate(periodEnd.getUTCDate() + interval);
```

**After:**
```typescript
const dateDomain = new DateDomainService();
const currentPeriod = dateDomain.createPeriodStart(recurrence.lastPeriodStart);
const nextPeriod = dateDomain.calculateNextPeriod(currentPeriod, 'interval', interval);
```

---

**Fin del Diseño**

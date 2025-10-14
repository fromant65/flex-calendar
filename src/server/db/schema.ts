import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `flex-calendar_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull().unique(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  password: d.varchar({ length: 255 }), // Hashed password for credentials auth
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Task Management Schema

export const taskRecurrences = createTable(
  "task_recurrence",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    creationDate: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    interval: d.integer(), // Number of units between recurrences (e.g., every 2 days)
    daysOfWeek: d.text().array(), // Array of day names: ['Mon', 'Tue', etc.]
    daysOfMonth: d.integer().array(), // Array of day numbers: [1, 15, etc.]
    maxOccurrences: d.integer(), // Maximum number of occurrences per period (for Habit+) or total (for finite recurrence)
    completedOccurrences: d.integer().default(0), // Number of completed occurrences in current period
    lastPeriodStart: d.timestamp({ withTimezone: true }), // Start date of the current period
    endDate: d.timestamp({ withTimezone: true }), // Absolute end date for recurrence
  }),
);

export const tasks = createTable(
  "task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    name: d.varchar({ length: 512 }).notNull(),
    description: d.text(),
    recurrenceId: d
      .integer()
      .references(() => taskRecurrences.id),
    importance: d.integer().notNull().default(5), // 1-10 scale
    isActive: d.boolean().notNull().default(true),
    isFixed: d.boolean().notNull().default(false), // Whether this task has fixed calendar times
    fixedStartTime: d.time(), // Fixed start time (e.g., "09:00:00")
    fixedEndTime: d.time(), // Fixed end time (e.g., "17:00:00")
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("task_owner_idx").on(t.ownerId),
    index("task_recurrence_idx").on(t.recurrenceId),
  ],
);

export const taskOccurrences = createTable(
  "task_occurrence",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    associatedTaskId: d
      .integer()
      .notNull()
      .references(() => tasks.id),
    startDate: d.timestamp({ withTimezone: true }).notNull(),
    limitDate: d.timestamp({ withTimezone: true }),
    targetDate: d.timestamp({ withTimezone: true }),
    targetTimeConsumption: d.real(), // Hours
    timeConsumed: d.real().default(0), // Hours
    status: d
      .varchar({ length: 50 })
      .notNull()
      .default("Pending"), // 'Pending' | 'In Progress' | 'Completed' | 'Skipped'
    urgency: d.real().default(0), // Calculated urgency value
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("occurrence_task_idx").on(t.associatedTaskId),
    index("occurrence_status_idx").on(t.status),
    index("occurrence_start_date_idx").on(t.startDate),
  ],
);

export const calendarEvents = createTable(
  "calendar_event",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    context: d.text(),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    associatedOccurrenceId: d
      .integer()
      .references(() => taskOccurrences.id),
    isFixed: d.boolean().notNull().default(false),
    start: d.timestamp({ withTimezone: true }).notNull(),
    finish: d.timestamp({ withTimezone: true }).notNull(),
    isCompleted: d.boolean().notNull().default(false),
    dedicatedTime: d.real().default(0), // Hours
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("event_owner_idx").on(t.ownerId),
    index("event_occurrence_idx").on(t.associatedOccurrenceId),
    index("event_start_idx").on(t.start),
  ],
);

// Relations

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
  recurrence: one(taskRecurrences, {
    fields: [tasks.recurrenceId],
    references: [taskRecurrences.id],
  }),
  occurrences: many(taskOccurrences),
}));

export const taskOccurrencesRelations = relations(taskOccurrences, ({ one, many }) => ({
  task: one(tasks, {
    fields: [taskOccurrences.associatedTaskId],
    references: [tasks.id],
  }),
  events: many(calendarEvents),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  owner: one(users, {
    fields: [calendarEvents.ownerId],
    references: [users.id],
  }),
  occurrence: one(taskOccurrences, {
    fields: [calendarEvents.associatedOccurrenceId],
    references: [taskOccurrences.id],
  }),
}));

export const taskRecurrencesRelations = relations(taskRecurrences, ({ many }) => ({
  tasks: many(tasks),
}));

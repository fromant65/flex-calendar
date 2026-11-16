import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `flex-calendar_${name}`);

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
  role: d.varchar({ length: 50 }), // User role: 'admin' | null
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

// V2 Domain Schema

export const taskStatusEnum = pgEnum("flex_calendar_task_status", [
  "active",
  "paused",
  "completed",
]);

export const occurrenceStatusEnum = pgEnum("flex_calendar_occurrence_status", [
  "unassigned",
  "pending",
  "in_progress",
  "completed",
  "skipped",
]);

export const routineEdgeTypeEnum = pgEnum("flex_calendar_routine_edge_type", [
  "ORDER",
  "DEPENDENCY",
]);

export const routineRecurrenceTypeEnum = pgEnum("flex_calendar_routine_recurrence_type", [
  "none",
  "finite",
  "infinite",
]);

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
    importance: d.integer().notNull().default(5),
    difficulty: d.integer().notNull().default(3),
    isDivisible: d.boolean().notNull().default(false),
    urgencyThresholdAt: d.timestamp({ withTimezone: true }),
    durationMinutes: d.integer(),
    isFixed: d.boolean().notNull().default(false),
    fixedStartTime: d.time(),
    fixedEndTime: d.time(),
    status: taskStatusEnum().notNull().default("active"),
    completedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("task_owner_idx").on(t.ownerId),
    index("task_status_idx").on(t.status),
    check("task_difficulty_range_chk", sql`${t.difficulty} >= 1 AND ${t.difficulty} <= 5`),
    check("task_duration_non_negative_chk", sql`${t.durationMinutes} IS NULL OR ${t.durationMinutes} >= 0`),
  ],
);

export const taskOccurrences = createTable(
  "task_occurrence",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    taskId: d
      .integer()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    slotStartAt: d.timestamp({ withTimezone: true }),
    slotEndAt: d.timestamp({ withTimezone: true }),
    dueAt: d.timestamp({ withTimezone: true }),
    tentativeAt: d.timestamp({ withTimezone: true }),
    targetTimeMinutes: d.integer(),
    timeSpentMinutes: d.integer().notNull().default(0),
    status: occurrenceStatusEnum().notNull().default("unassigned"),
    completedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("occurrence_task_idx").on(t.taskId),
    index("occurrence_status_idx").on(t.status),
    index("occurrence_slot_start_idx").on(t.slotStartAt),
    index("occurrence_due_idx").on(t.dueAt),
    check(
      "occurrence_slot_coherence_chk",
      sql`(${t.slotStartAt} IS NULL AND ${t.slotEndAt} IS NULL) OR (${t.slotStartAt} IS NOT NULL AND ${t.slotEndAt} IS NOT NULL)`,
    ),
    check(
      "occurrence_time_spent_non_negative_chk",
      sql`${t.timeSpentMinutes} >= 0`,
    ),
    check(
      "occurrence_target_time_non_negative_chk",
      sql`${t.targetTimeMinutes} IS NULL OR ${t.targetTimeMinutes} >= 0`,
    ),
  ],
);

export const routines = createTable(
  "routine",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    ownerId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 512 }).notNull(),
    description: d.text(),
    recurrenceType: routineRecurrenceTypeEnum().notNull().default("none"),
    recurrenceInterval: d.integer(),
    recurrenceDaysOfWeek: d.text().array(),
    recurrenceDaysOfMonth: d.integer().array(),
    recurrenceMaxOccurrences: d.integer(),
    recurrenceLastPeriodStart: d.timestamp({ withTimezone: true }),
    recurrenceEndDate: d.timestamp({ withTimezone: true }),
    isActive: d.boolean().notNull().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("routine_owner_idx").on(t.ownerId),
    index("routine_active_idx").on(t.isActive),
  ],
);

export const routineTasks = createTable(
  "routine_task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    routineId: d
      .integer()
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    taskId: d
      .integer()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    order: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("routine_task_routine_idx").on(t.routineId),
    index("routine_task_order_idx").on(t.routineId, t.order),
    uniqueIndex("routine_task_unique_idx").on(t.routineId, t.taskId),
  ],
);

export const routineEdges = createTable(
  "routine_edge",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    routineId: d
      .integer()
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    fromTaskId: d
      .integer()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    toTaskId: d
      .integer()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    edgeType: routineEdgeTypeEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("routine_edge_routine_idx").on(t.routineId),
    index("routine_edge_from_task_idx").on(t.fromTaskId),
    index("routine_edge_to_task_idx").on(t.toTaskId),
    uniqueIndex("routine_edge_unique_idx").on(
      t.routineId,
      t.fromTaskId,
      t.toTaskId,
      t.edgeType,
    ),
    check("routine_edge_no_self_loop_chk", sql`${t.fromTaskId} <> ${t.toTaskId}`),
  ],
);

// Relations

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
  occurrences: many(taskOccurrences),
  routineLinks: many(routineTasks),
  outgoingEdges: many(routineEdges, { relationName: "routine_edge_from_task" }),
  incomingEdges: many(routineEdges, { relationName: "routine_edge_to_task" }),
}));

export const taskOccurrencesRelations = relations(taskOccurrences, ({ one }) => ({
  task: one(tasks, {
    fields: [taskOccurrences.taskId],
    references: [tasks.id],
  }),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  owner: one(users, {
    fields: [routines.ownerId],
    references: [users.id],
  }),
  tasks: many(routineTasks),
  edges: many(routineEdges),
}));

export const routineTasksRelations = relations(routineTasks, ({ one }) => ({
  routine: one(routines, {
    fields: [routineTasks.routineId],
    references: [routines.id],
  }),
  task: one(tasks, {
    fields: [routineTasks.taskId],
    references: [tasks.id],
  }),
}));

export const routineEdgesRelations = relations(routineEdges, ({ one }) => ({
  routine: one(routines, {
    fields: [routineEdges.routineId],
    references: [routines.id],
  }),
  fromTask: one(tasks, {
    relationName: "routine_edge_from_task",
    fields: [routineEdges.fromTaskId],
    references: [tasks.id],
  }),
  toTask: one(tasks, {
    relationName: "routine_edge_to_task",
    fields: [routineEdges.toTaskId],
    references: [tasks.id],
  }),
}));

// Notifications Schema

export const notifications = createTable(
  "notification",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text().notNull(),
    isActive: d.boolean().notNull().default(true),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("notification_active_idx").on(t.isActive),
    index("notification_created_idx").on(t.createdAt),
  ],
);

export const notificationsUsers = createTable(
  "notification_user",
  (d) => ({
    notificationId: d
      .integer()
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.notificationId, t.userId] }),
    index("notification_user_notification_idx").on(t.notificationId),
    index("notification_user_user_idx").on(t.userId),
  ],
);

// Notification Relations

export const notificationsRelations = relations(notifications, ({ many }) => ({
  notificationsUsers: many(notificationsUsers),
}));

export const notificationsUsersRelations = relations(notificationsUsers, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationsUsers.notificationId],
    references: [notifications.id],
  }),
  user: one(users, {
    fields: [notificationsUsers.userId],
    references: [users.id],
  }),
}));

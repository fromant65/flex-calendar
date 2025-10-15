ALTER TABLE "flex-calendar_calendar_event" ADD COLUMN "completedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "flex-calendar_task_occurrence" ADD COLUMN "completedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "flex-calendar_task" ADD COLUMN "completedAt" timestamp with time zone;
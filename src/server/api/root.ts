import { taskRouter } from "~/server/api/routers/task.router";
import { occurrenceRouter } from "~/server/api/routers/occurrence.router";
import { calendarEventRouter } from "~/server/api/routers/calendar-event.router";
import { authRouter } from "~/server/api/routers/auth.router";
import { timelineRouter } from "~/server/api/routers/timeline.router";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  task: taskRouter,
  occurrence: occurrenceRouter,
  calendarEvent: calendarEventRouter,
  timeline: timelineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

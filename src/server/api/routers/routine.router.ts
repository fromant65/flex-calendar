import { z } from "zod";

import { RoutineService } from "~/server/api/services/routines/routine.service";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const edgeTypeSchema = z.enum(["ORDER", "DEPENDENCY"]);
const dayOfWeekSchema = z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

const routineRecurrenceSchema = z.object({
  recurrenceType: z.enum(["none", "finite", "infinite"]),
  interval: z.number().int().positive().optional(),
  daysOfWeek: z.array(dayOfWeekSchema).optional(),
  daysOfMonth: z.array(z.number().int().min(1).max(31)).optional(),
  maxOccurrences: z.number().int().positive().optional(),
  lastPeriodStart: z.date().optional(),
  endDate: z.date().optional(),
});

const createRoutineSchema = z.object({
  name: z.string().min(1).max(512),
  description: z.string().optional(),
  recurrence: routineRecurrenceSchema.optional(),
});

const updateRoutineSchema = z.object({
  name: z.string().min(1).max(512).optional(),
  description: z.string().optional(),
  recurrence: routineRecurrenceSchema.partial().optional(),
  isActive: z.boolean().optional(),
});

export const routineRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRoutineSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.createRoutine(ctx.session.user.id, input);
    }),

  getMyRoutines: protectedProcedure.query(async ({ ctx }) => {
    const service = new RoutineService();
    return await service.getMyRoutines(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .query(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.getRoutineById(ctx.session.user.id, input.routineId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        data: updateRoutineSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.updateRoutine(ctx.session.user.id, input.routineId, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.deleteRoutine(ctx.session.user.id, input.routineId);
    }),

  addTask: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        taskId: z.number(),
        order: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.addTask(ctx.session.user.id, input.routineId, input.taskId, input.order);
    }),

  removeTask: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        taskId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.removeTask(ctx.session.user.id, input.routineId, input.taskId);
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        entries: z.array(
          z.object({
            taskId: z.number(),
            order: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.reorderTasks(ctx.session.user.id, input.routineId, input.entries);
    }),

  addDependency: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        fromTaskId: z.number(),
        toTaskId: z.number(),
        edgeType: edgeTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.addDependency(
        ctx.session.user.id,
        input.routineId,
        input.fromTaskId,
        input.toTaskId,
        input.edgeType,
      );
    }),

  removeDependency: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        fromTaskId: z.number(),
        toTaskId: z.number(),
        edgeType: edgeTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.removeDependency(
        ctx.session.user.id,
        input.routineId,
        input.fromTaskId,
        input.toTaskId,
        input.edgeType,
      );
    }),

  validateDag: protectedProcedure
    .input(z.object({ routineId: z.number() }))
    .query(async ({ ctx, input }) => {
      const service = new RoutineService();
      return await service.validateDag(ctx.session.user.id, input.routineId);
    }),
});

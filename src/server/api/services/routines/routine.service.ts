import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { routineEdges, routines, routineTasks, tasks } from "~/server/db/schema";

type EdgeType = "ORDER" | "DEPENDENCY";
type RoutineRecurrenceType = "none" | "finite" | "infinite";

type RoutineRecurrenceInput = {
  recurrenceType?: RoutineRecurrenceType;
  interval?: number;
  daysOfWeek?: string[];
  daysOfMonth?: number[];
  maxOccurrences?: number;
  lastPeriodStart?: Date;
  endDate?: Date;
};

interface CreateRoutineInput {
  name: string;
  description?: string;
  recurrence?: RoutineRecurrenceInput;
}

interface UpdateRoutineInput {
  name?: string;
  description?: string;
  recurrence?: RoutineRecurrenceInput;
  isActive?: boolean;
}

interface ReorderTaskInput {
  taskId: number;
  order: number;
}

export class RoutineService {
  async createRoutine(ownerId: string, input: CreateRoutineInput) {
    const recurrence = input.recurrence ?? { recurrenceType: "none" as const };

    const [created] = await db
      .insert(routines)
      .values({
        ownerId,
        name: input.name,
        description: input.description,
        recurrenceType: recurrence.recurrenceType ?? "none",
        recurrenceInterval: recurrence.interval,
        recurrenceDaysOfWeek: recurrence.daysOfWeek,
        recurrenceDaysOfMonth: recurrence.daysOfMonth,
        recurrenceMaxOccurrences: recurrence.maxOccurrences,
        recurrenceLastPeriodStart: recurrence.lastPeriodStart,
        recurrenceEndDate: recurrence.endDate,
      })
      .returning();

    return created;
  }

  async getRoutineById(ownerId: string, routineId: number) {
    await this.assertRoutineOwner(ownerId, routineId);

    const [routine] = await db
      .select()
      .from(routines)
      .where(eq(routines.id, routineId));

    const routineTaskRows = await db
      .select()
      .from(routineTasks)
      .where(eq(routineTasks.routineId, routineId))
      .orderBy(asc(routineTasks.order));

    const taskIds = routineTaskRows.map((entry) => entry.taskId);
    const routineTaskEntities =
      taskIds.length > 0
        ? await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.ownerId, ownerId), inArray(tasks.id, taskIds)))
        : [];

    const edges = await db
      .select()
      .from(routineEdges)
      .where(eq(routineEdges.routineId, routineId));

    return {
      routine,
      routineTasks: routineTaskRows,
      tasks: routineTaskEntities,
      edges,
    };
  }

  async getMyRoutines(ownerId: string) {
    return await db
      .select()
      .from(routines)
      .where(eq(routines.ownerId, ownerId))
      .orderBy(asc(routines.id));
  }

  async updateRoutine(ownerId: string, routineId: number, input: UpdateRoutineInput) {
    await this.assertRoutineOwner(ownerId, routineId);

    const recurrence = input.recurrence;
    const recurrenceUpdate = recurrence
      ? {
          recurrenceType: recurrence.recurrenceType,
          recurrenceInterval: recurrence.interval,
          recurrenceDaysOfWeek: recurrence.daysOfWeek,
          recurrenceDaysOfMonth: recurrence.daysOfMonth,
          recurrenceMaxOccurrences: recurrence.maxOccurrences,
          recurrenceLastPeriodStart: recurrence.lastPeriodStart,
          recurrenceEndDate: recurrence.endDate,
        }
      : {};

    const [updated] = await db
      .update(routines)
      .set({
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        ...recurrenceUpdate,
      })
      .where(eq(routines.id, routineId))
      .returning();

    return updated;
  }

  async deleteRoutine(ownerId: string, routineId: number) {
    await this.assertRoutineOwner(ownerId, routineId);

    await db.delete(routines).where(eq(routines.id, routineId));
    return { success: true } as const;
  }

  async addTask(ownerId: string, routineId: number, taskId: number, order?: number) {
    await this.assertRoutineOwner(ownerId, routineId);
    await this.assertTaskOwner(ownerId, taskId);

    const [existingLink] = await db
      .select()
      .from(routineTasks)
      .where(and(eq(routineTasks.routineId, routineId), eq(routineTasks.taskId, taskId)));

    if (existingLink) {
      return existingLink;
    }

    let finalOrder = order;
    if (finalOrder === undefined) {
      const [aggregate] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${routineTasks.order}), 0)` })
        .from(routineTasks)
        .where(eq(routineTasks.routineId, routineId));
      finalOrder = (aggregate?.maxOrder ?? 0) + 1;
    }

    const [created] = await db
      .insert(routineTasks)
      .values({
        routineId,
        taskId,
        order: finalOrder,
      })
      .returning();

    return created;
  }

  async removeTask(ownerId: string, routineId: number, taskId: number) {
    await this.assertRoutineOwner(ownerId, routineId);

    await db
      .delete(routineEdges)
      .where(
        and(
          eq(routineEdges.routineId, routineId),
          sql`(${routineEdges.fromTaskId} = ${taskId} OR ${routineEdges.toTaskId} = ${taskId})`,
        ),
      );

    await db
      .delete(routineTasks)
      .where(and(eq(routineTasks.routineId, routineId), eq(routineTasks.taskId, taskId)));

    return { success: true } as const;
  }

  async reorderTasks(ownerId: string, routineId: number, entries: ReorderTaskInput[]) {
    await this.assertRoutineOwner(ownerId, routineId);

    await db.transaction(async (tx) => {
      for (const item of entries) {
        await tx
          .update(routineTasks)
          .set({ order: item.order })
          .where(
            and(
              eq(routineTasks.routineId, routineId),
              eq(routineTasks.taskId, item.taskId),
            ),
          );
      }
    });

    return await db
      .select()
      .from(routineTasks)
      .where(eq(routineTasks.routineId, routineId))
      .orderBy(asc(routineTasks.order));
  }

  async addDependency(
    ownerId: string,
    routineId: number,
    fromTaskId: number,
    toTaskId: number,
    edgeType: EdgeType,
  ) {
    await this.assertRoutineOwner(ownerId, routineId);
    await this.assertTaskInRoutine(routineId, fromTaskId);
    await this.assertTaskInRoutine(routineId, toTaskId);

    const [created] = await db
      .insert(routineEdges)
      .values({
        routineId,
        fromTaskId,
        toTaskId,
        edgeType,
      })
      .onConflictDoNothing()
      .returning();

    const hasCycle = await this.hasCycle(routineId);
    if (hasCycle) {
      await db
        .delete(routineEdges)
        .where(
          and(
            eq(routineEdges.routineId, routineId),
            eq(routineEdges.fromTaskId, fromTaskId),
            eq(routineEdges.toTaskId, toTaskId),
            eq(routineEdges.edgeType, edgeType),
          ),
        );
      throw new Error("La dependencia genera un ciclo en la rutina");
    }

    return created ?? null;
  }

  async removeDependency(
    ownerId: string,
    routineId: number,
    fromTaskId: number,
    toTaskId: number,
    edgeType: EdgeType,
  ) {
    await this.assertRoutineOwner(ownerId, routineId);

    await db
      .delete(routineEdges)
      .where(
        and(
          eq(routineEdges.routineId, routineId),
          eq(routineEdges.fromTaskId, fromTaskId),
          eq(routineEdges.toTaskId, toTaskId),
          eq(routineEdges.edgeType, edgeType),
        ),
      );

    return { success: true } as const;
  }

  async validateDag(ownerId: string, routineId: number) {
    await this.assertRoutineOwner(ownerId, routineId);
    const hasCycle = await this.hasCycle(routineId);

    return {
      isValid: !hasCycle,
      hasCycle,
    };
  }

  private async hasCycle(routineId: number): Promise<boolean> {
    const edges = await db
      .select({ fromTaskId: routineEdges.fromTaskId, toTaskId: routineEdges.toTaskId })
      .from(routineEdges)
      .where(eq(routineEdges.routineId, routineId));

    const graph = new Map<number, number[]>();
    const nodes = new Set<number>();

    for (const edge of edges) {
      nodes.add(edge.fromTaskId);
      nodes.add(edge.toTaskId);
      const adjacency = graph.get(edge.fromTaskId) ?? [];
      adjacency.push(edge.toTaskId);
      graph.set(edge.fromTaskId, adjacency);
    }

    const visiting = new Set<number>();
    const visited = new Set<number>();

    const dfs = (node: number): boolean => {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;

      visiting.add(node);
      const neighbors = graph.get(node) ?? [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      visiting.delete(node);
      visited.add(node);
      return false;
    };

    for (const node of nodes) {
      if (dfs(node)) return true;
    }

    return false;
  }

  private async assertRoutineOwner(ownerId: string, routineId: number) {
    const [routine] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(and(eq(routines.id, routineId), eq(routines.ownerId, ownerId)));

    if (!routine) {
      throw new Error("Routine no encontrada o sin permisos");
    }
  }

  private async assertTaskOwner(ownerId: string, taskId: number) {
    const [task] = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.ownerId, ownerId)));

    if (!task) {
      throw new Error("Task no encontrada o sin permisos");
    }
  }

  private async assertTaskInRoutine(routineId: number, taskId: number) {
    const [entry] = await db
      .select({ routineId: routineTasks.routineId })
      .from(routineTasks)
      .where(and(eq(routineTasks.routineId, routineId), eq(routineTasks.taskId, taskId)));

    if (!entry) {
      throw new Error("La task no pertenece a la rutina");
    }
  }
}

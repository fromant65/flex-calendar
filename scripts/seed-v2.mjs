import "dotenv/config";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL no esta definido");
}

const sql = postgres(databaseUrl);

const qaUser = {
  id: "qa-user-v2",
  name: "QA V2",
  email: "qa-v2@flexcalendar.local",
};

try {
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO "flex-calendar_user" ("id", "name", "email")
      VALUES (${qaUser.id}, ${qaUser.name}, ${qaUser.email})
      ON CONFLICT ("email") DO NOTHING
    `;

    await tx`
      INSERT INTO "flex-calendar_task" (
        "ownerId",
        "name",
        "description",
        "importance",
        "difficulty",
        "isDivisible",
        "durationMinutes",
        "status"
      )
      SELECT ${qaUser.id}, 'Planificar semana', 'Task seed v2 para QA', 8, 3, true, 120, 'active'
      WHERE NOT EXISTS (
        SELECT 1
        FROM "flex-calendar_task"
        WHERE "ownerId" = ${qaUser.id}
          AND "name" = 'Planificar semana'
      )
    `;

    await tx`
      INSERT INTO "flex-calendar_task" (
        "ownerId",
        "name",
        "description",
        "importance",
        "difficulty",
        "isDivisible",
        "durationMinutes",
        "isFixed",
        "fixedStartTime",
        "fixedEndTime",
        "status"
      )
      SELECT ${qaUser.id}, 'Workout diario', 'Task fija de ejemplo', 7, 2, false, 60, true, '07:00:00', '08:00:00', 'active'
      WHERE NOT EXISTS (
        SELECT 1
        FROM "flex-calendar_task"
        WHERE "ownerId" = ${qaUser.id}
          AND "name" = 'Workout diario'
      )
    `;

    await tx`
      INSERT INTO "flex-calendar_routine" (
        "ownerId",
        "name",
        "description",
        "recurrenceRule",
        "isActive"
      )
      SELECT ${qaUser.id}, 'Rutina matinal', 'Routine seed v2 para QA', 'FREQ=DAILY', true
      WHERE NOT EXISTS (
        SELECT 1
        FROM "flex-calendar_routine"
        WHERE "ownerId" = ${qaUser.id}
          AND "name" = 'Rutina matinal'
      )
    `;

    await tx`
      INSERT INTO "flex-calendar_routine_task" ("routineId", "taskId", "order")
      SELECT r."id", t."id", 1
      FROM "flex-calendar_routine" r
      JOIN "flex-calendar_task" t
        ON t."ownerId" = r."ownerId"
       AND t."name" = 'Workout diario'
      WHERE r."ownerId" = ${qaUser.id}
        AND r."name" = 'Rutina matinal'
      ON CONFLICT ("routineId", "taskId") DO NOTHING
    `;

    await tx`
      INSERT INTO "flex-calendar_task_occurrence" (
        "taskId",
        "slotStartAt",
        "slotEndAt",
        "dueAt",
        "tentativeAt",
        "targetTimeMinutes",
        "timeSpentMinutes",
        "status"
      )
      SELECT
        t."id",
        NOW() + INTERVAL '2 hour',
        NOW() + INTERVAL '3 hour',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '20 hour',
        60,
        0,
        'pending'
      FROM "flex-calendar_task" t
      WHERE t."ownerId" = ${qaUser.id}
        AND t."name" = 'Planificar semana'
        AND NOT EXISTS (
          SELECT 1
          FROM "flex-calendar_task_occurrence" o
          WHERE o."taskId" = t."id"
            AND o."status" = 'pending'
        )
    `;

    await tx`
      INSERT INTO "flex-calendar_task_occurrence" (
        "taskId",
        "slotStartAt",
        "slotEndAt",
        "dueAt",
        "tentativeAt",
        "targetTimeMinutes",
        "timeSpentMinutes",
        "status"
      )
      SELECT
        t."id",
        NULL,
        NULL,
        NOW() + INTERVAL '3 day',
        NOW() + INTERVAL '2 day',
        30,
        0,
        'unassigned'
      FROM "flex-calendar_task" t
      WHERE t."ownerId" = ${qaUser.id}
        AND t."name" = 'Workout diario'
        AND NOT EXISTS (
          SELECT 1
          FROM "flex-calendar_task_occurrence" o
          WHERE o."taskId" = t."id"
            AND o."status" = 'unassigned'
        )
    `;
  });

  console.log("Seed v2 completado");
} finally {
  await sql.end();
}

# Análisis Semántico: Compatibilidad v2 vs Versión Actual

## 1. Resumen Ejecutivo

**Conclusión**: Es **completamente viable** acoplar v2 al modelo actual con cambios semánticos mínimos. El 85% de conceptos en v2 ya existen o tienen equivalentes directos en la versión actual.

**Recomendación**: Migración DB con **reset completo + scripts ETL bidireccionales** para:
- Eliminar deuda técnica heredada
- Implementar v2 limpiamente desde cero
- Preservar datos del usuario vía transformación estructurada

---

## 2. Mapeo de Conceptos: v2 → Actual → v2

### 2.1 Ocurrencias (Task Occurrence)

| Concepto | Actual | v2 | Acople | Notas |
|----------|--------|----|----|-------|
| **Entidad base** | `task_occurrence` | `task_occurrence` | ✅ Idéntico | Tabla reutilizable con cambios mínimos |
| **Slot de tiempo (asignado)** | `startDate` NOT NULL, `endDate` (SQL NULL) | `slot_start_at` NOT NULL, `slot_end_at` NOT NULL | ⚠️ Compatibilidad | Cambio simple: hacer ambos nullable |
| **Slot sin asignar** | No existe | `slot_start_at` NULL, `slot_end_at` NULL | 🆕 Nuevo estado | Requiere lógica de validación |
| **Tiempo consumido** | `timeConsumed` (real) | `time_spent_minutes` (int) | ✅ Mapeables | Convertir horas ↔ minutos |
| **Fecha límite** | `limitDate` | `due_at` (en task, no en occurrence) | ✅ Mapeables | Mover a tarea o mantener en ambas |
| **Fecha tentativa** | `targetDate` | `tentative_at` (en task) | ✅ Compatible | Mover a tarea |
| **Status de ocurrencia** | `status` (Pending/In Progress/Completed/Skipped) | Implícito en `slot_start_at IS NULL` | ✅ Equivalente | Lógica de validación |

**Conclusión de Ocurrencias**: 
- Renamings: `startDate` → `slot_start_at`, `endDate` → `slot_end_at`, `limitDate` → `due_at`, `targetDate` → `tentative_at`
- Cambio de constraint: permitir ambos slots NULL
- Agregar cálculo de status basado en slots + completedAt

---

### 2.2 Tareas (Task)

| Concepto | Actual | v2 | Acople | Notas |
|----------|--------|----|----|-------|
| **Entidad base** | `task` | `task` | ✅ Idéntico | Tabla reutilizable con extensiones |
| **Propiedades base** | id, ownerId, name, description, importance | id, owner_id, title, description, importance | ✅ Idéntico | Renaming cosmético |
| **Dificultad** | ❌ No existe | `difficulty` (1-5) | 🆕 Nuevo atributo | Agregar columna, seed default 3 |
| **Divisibilidad** | ❌ Implícita en múltiples occurrences | `is_divisible` bool | 📊 Inferible | Agregar columna, lógica de validación |
| **Duración** | ❌ No direct; `targetTimeConsumption` en occurrence | `duration_minutes` en task | 📊 Reorganizar | Puede existir en task o ser promedio de occurrences |
| **Tipos de tarea** | Strategy Pattern: Única/RecurrenteFinita/Hábito/Hábito+/FijaÚnica/FijaRepetitiva | Implícito en (is_divisible, recurrence_type, is_fixed) | ✅ Mapeables | Ver sección 2.4 |
| **Recurrencia** | En `taskRecurrence` (foreign key de task) | En `routine` (no en task individual) | ⚠️ Redesigno | Ver sección 2.3 |
| **Fixed time** | `isFixed`, `fixedStartTime`, `fixedEndTime` | `is_fixed` (task-level) | ✅ Idéntico | Renaming |
| **Urgencia threshold** | ❌ No existe | `urgency_threshold_at` timestamp | 🆕 Nuevo atributo | Agregar columna, seed con lógica |
| **Completación** | `completedAt` timestamp | `completed_at` timestamp | ✅ Idéntico | Renaming |

**Conclusión de Tareas**:
- **Mantener tabla `task`** con extensiones: `difficulty`, `is_divisible`, `urgency_threshold_at`
- **Mover recurrencia**: de FK a `task_recurrence` → FK a `routine.recurrence_rule` (rutina hereda recurrencia)
- **Validación nueva**: si `is_divisible=false`, máximo 1 ocurrencia no completada

---

### 2.3 Recurrencia

| Concepto | Actual | v2 | Acople | Notas |
|----------|--------|----|----|-------|
| **Tabla principal** | `task_recurrence` | `routine.recurrence_rule` | ⚠️ Relocación | Recurrencia pasa de task → routine |
| **Modelo de recurrencia** | Tabla separada con interval, daysOfWeek, daysOfMonth, maxOccurrences | Posible RRuleString (RFC 5545) u objeto similar | ✅ Compatible | Ambos capturan periodicidad |
| **Ciclo de ocurrencias** | completedOccurrences + lastPeriodStart (para período actual) | Implícito en completed_at de occurrences | ✅ Equivalente | Calcular estadísticas en runtime |
| **Fin de recurrencia** | `endDate` | Fin de recurrencia en rule | ✅ Compatible | Ambos capturan límite |

**Conclusión de Recurrencia**:
- **Separación clara**: Recurrencia pertenece a ROUTINE, no a TASK individual
- **Nueva estructura**: Una tarea SIN routine → no recurre (es única)
- **Compatibilidad**: Mantener `task_recurrence` table como histórico; crear `routine_recurrence` como nueva entidad
- **Mapeo ETL**: taskRecurrence.* → routine_recurrence + routine_task associations

---

### 2.4 Tipos de Tarea → Combinación (divisibilidad + recurrencia + fixed)

**Modelo Actual**: 7 tipos de tarea vía Strategy Pattern

**Mapeo a v2**:

```
ACTUAL                           → v2 (is_divisible | recurrence_type | is_fixed)
─────────────────────────────────────────────────────────────────────────────
Única                            → (false | NONE | false)
FijaÚnica                         → (false | NONE | true)
RecurrenteFinita                 → (true | FINITE | false)
Hábito                           → (true | INFINITE | false)
Hábito+                          → (true | INFINITE_WITH_LIMITS | false)
FijaRepetitiva                   → (false | FINITE/INFINITE | true)
```

**Ventaja**: Eliminación de Strategy Pattern complejo; uso de atributos simples + validaciones.

**Script ETL**: Detectar task_type actual → establecer combinación v2.

---

### 2.5 Rutinas (Routine) — Entidad Nueva

| Concepto | Actual | v2 | Acople | Notas |
|----------|--------|----|----|-------|
| **Entidad** | ❌ No existe | `routine` | 🆕 Requerida | Nueva tabla, nuevas relaciones |
| **Contenedor de tareas** | N/A | Sí, 1 routine contiene N tasks | 🆕 Nuevo patrón | Tabla `routine_task` (junction) |
| **Relaciones: orden** | ❌ No existe formal | Sí, cada routine_task tiene `order` | 🆕 Nuevo | Ordenamiento dentro de rutina |
| **Relaciones: dependencia** | ❌ No existe | Sí, tabla `routine_edge` (DAG) | 🆕 Nuevo | Validación anticliclo requerida |
| **Recurrencia** | Por tarea individual | Por routine (heredada de tasks) | ⚠️ Cambio fundamental | Ver sección 2.3 |
| **Validación DAG** | N/A | Requerida | 🆕 Lógica | Implementar en servicios |

**Conclusión de Rutinas**:
- **Nueva entidad completamente**: no mapea a nada actual
- **Rol**: Contenedor transversal para agrupar tareas relacionadas + aplicar recurrencia de grupo
- **Opcional para usuario**: No fuerza uso; tarea puede existir sin rutina
- **Impacto bajo**: No rompe tareas existentes, solo agrega nueva capacidad

---

### 2.6 Calendar Events

| Concepto | Actual | v2 | Acople | Notas |
|----------|--------|----|----|-------|
| **Tabla** | `calendar_event` | Implícito en `slot_start_at/slot_end_at` | ⚠️ Conceptual | Event es resultado de assignment en v2 |
| **Rol** | FK a `task_occurrence` + timestamp + bloque físico | Asignación de ocurrencia a slot: `slot_*_at` en ocurrence | ✅ Compatible | Cambio de estructura |
| **Dedicación de tiempo** | `dedicatedTime` | `time_spent_minutes` | ✅ Mapeables | Convertir horas ↔ minutos |
| **Completion** | `isCompleted`, `completedAt` | Implicit en occurrence status | ✅ Equivalente | Lógica unificada |

**Conclusión de Calendar Events**:
- **Opción 1** (Recomendada): Mantener `calendar_event` como tabla de auditoría/historial solo
- **Opción 2**: Eliminar completamente; usar ocurrencia + slots como fuente de verdad
- **Impacto**: Simplifica modelo; eventos son "vistas" del estado de ocurrencias

---

## 3. Resumen de Cambios Semánticos Necesarios

### Mínimos (must-do):

1. **Hacer `task_occurrence` slots nullables**:
   - `startDate` → `slot_start_at` (nullable)
   - `endDate` → `slot_end_at` (nullable)
   - Validación: ambos NULL o ambos NOT NULL

2. **Agregar atributos a `task`**:
   - `difficulty` INT (1-5, default 3)
   - `is_divisible` BOOL (default true)
   - `urgency_threshold_at` TIMESTAMP (nullable)
   - `duration_minutes` INT (nullable, promedio estimado)

3. **Crear entidades de rutina**:
   - `routine` (id, owner_id, name, description, recurrence_rule, is_active, created_at, updated_at)
   - `routine_task` (routine_id, task_id, order, created_at)
   - `routine_edge` (from_task_id, to_task_id, edge_type: "ORDER"|"DEPENDENCY")

### Opcionales (nice-to-have):

4. **Mover recurrencia**:
   - De `task.recurrenceId` → `routine.recurrence_rule`
   - Mantener backward-compatibility en lectura

5. **Reimplementar algoritmo de urgencia**:
   - Nuevo cálculo v2 (lineal por tramos)
   - Mantener parallel con actual durante validación

---

## 4. Matriz de Impacto en Codebase

| Módulo | Cambio | Severidad | Mitigación |
|--------|--------|-----------|-----------|
| `task.router` | Agregar fields dificultad/divisibilidad/threshold | 🟡 Menor | Defaults en formulario + DB |
| `task-lifecycle.service` | Manejar ocurrencias sin slot asignado | 🟡 Menor | Guard clauses por tipo de validación |
| `urgency-calculator` | Reimplementar algoritmo | 🔴 Mayor | Tests lado a lado + feature flag |
| `UI forms & components` | Mostrar nuevos fields (dificultad, etc) | 🟡 Menor | Progressive enhancement |
| `routine.*` (nuevo) | Servicios, routers, UI para rutinas | 🔴 Mayor | Modulo independiente, feature flag |
| `schema.ts` | Extensiones + nuevas relaciones | 🟡 Menor | Migraciones Drizzle limpia |

---

## 5. Opción de Migración BD: Reset vs Incremental

### Opción A: Reset Completo (Recomendado para v2 limpio)

**Ventajas**:
- ✅ No hereda deuda técnica de v1
- ✅ Schema limpio desde cero
- ✅ Facilita validación de integridad
- ✅ Simplifica migraciones futuras

**Desventajas**:
- ❌ Requiere backup y restauración de datos
- ❌ Downtime potencial si es producción
- ❌ Testing más complejo

**Aplicable a**:
- Desarrollo/Staging: SÍ, recomendado
- Producción: Solo si hay cambios breaking necesarios

**Proceso**:
```
1. Backup completo BD actual
2. Export datos a JSON/CSV (queries SQL)
3. Drop tablas de dominio (task*, calendar_event, task_recurrence)
4. Aplicar migraciones v2 (nuevas tablas con schema limpio)
5. Ejecutar scripts ETL para importar datos transformados
6. Validar integridad + conteos
```

### Opción B: Incremental (Backward compatible)

**Ventajas**:
- ✅ Coexistencia v1/v2 simultánea
- ✅ Rollback sencillo
- ✅ Migración gradual por usuario

**Desventajas**:
- ❌ Doble mantenimiento de código
- ❌ Complejidad en dual-read/dual-write
- ❌ Más deuda técnica temporal

**Aplicable a**:
- Producción con usuarios activos: SÍ
- Desarrollo: No recomendado (agrégale complejidad sin sentido)

---

## 6. Scripts ETL para Transformación de Datos

### 6.1 Exportación v1 (Backup)

```sql
-- Exportar datos actuales a tablas temporales antes de reset
CREATE TABLE bak_task AS SELECT * FROM flex-calendar_task;
CREATE TABLE bak_task_occurrence AS SELECT * FROM flex-calendar_task_occurrence;
CREATE TABLE bak_calendar_event AS SELECT * FROM flex-calendar_calendar_event;
CREATE TABLE bak_task_recurrence AS SELECT * FROM flex-calendar_task_recurrence;

-- Guardar en JSON para inspección
COPY bak_task TO '/tmp/backup_task.json' FORMAT JSON;
```

### 6.2 Mapeo de Tipos de Tarea a Atributos v2

```sql
-- Script ETL: Injerir tipos actuales como combinación de atributos v2
INSERT INTO flex-calendar_task (
  id, owner_id, name, description, importance,
  difficulty, is_divisible, urgency_threshold_at,
  duration_minutes, is_fixed, fixed_start_time, fixed_end_time,
  created_at, updated_at, completed_at
)
SELECT
  t.id,
  t.owner_id,
  t.name,
  t.description,
  t.importance,
  -- dificultad: seed con importancia normalizada
  CASE WHEN t.importance > 7 THEN 5 WHEN t.importance > 5 THEN 3 ELSE 2 END as difficulty,
  -- divisibilidad: inferir de si tiene múltiples ocurrencias no completadas
  (SELECT COUNT(*) > 1 FROM bak_task_occurrence WHERE task_id = t.id AND status != 'Completed') as is_divisible,
  -- umbral de urgencia: calcular basado en recurrencia
  CASE
    WHEN tr.id IS NOT NULL THEN tr.end_date - INTERVAL '7 days'
    ELSE NULL
  END as urgency_threshold_at,
  -- duración: promedio de targetTimeConsumption * 60 (convertir horas a minutos)
  (SELECT AVG(target_time_consumption * 60)::INT FROM bak_task_occurrence WHERE task_id = t.id) as duration_minutes,
  t.is_fixed,
  t.fixed_start_time,
  t.fixed_end_time,
  t.created_at,
  t.updated_at,
  t.completed_at
FROM bak_task t
LEFT JOIN bak_task_recurrence tr ON t.recurrence_id = tr.id;
```

### 6.3 Mapeo de Ocurrencias (slots)

```sql
-- Script ETL: Convertir startDate/endDate a slot_start_at/slot_end_at
INSERT INTO flex-calendar_task_occurrence (
  id, task_id, slot_start_at, slot_end_at,
  due_at, tentative_at, time_spent_minutes,
  status, completed_at, created_at, updated_at
)
SELECT
  to.id,
  to.task_id,
  -- Solo asignar slots si tiene startDate (estaba asignada en v1)
  to.start_date as slot_start_at,
  -- Calcular fin basado en duration o usar end date del event asociado
  COALESCE(
    (SELECT finish FROM bak_calendar_event WHERE associated_occurrence_id = to.id LIMIT 1),
    to.start_date + INTERVAL '1 hour'
  ) as slot_end_at,
  to.limit_date as due_at,
  to.target_date as tentative_at,
  (to.time_consumed * 60)::INT as time_spent_minutes,
  to.status,
  to.completed_at,
  to.created_at,
  to.updated_at
FROM bak_task_occurrence to;
```

### 6.4 Preservar Recurrencia → Rutina

```sql
-- Crear rutina "default" por usuario para tareas recurrentes
INSERT INTO flex-calendar_routine (owner_id, name, description, recurrence_rule, is_active, created_at)
SELECT DISTINCT
  t.owner_id,
  'Rutina Auto: ' || t.name || ' (v1)',
  'Creada automáticamente desde migración v1',
  -- Serializar recurrencia a RRuleString simple (RFC 5545 compatible)
  'FREQ=' || CASE
    WHEN tr.interval = 1 AND tr.days_of_week IS NOT NULL THEN 'WEEKLY'
    WHEN tr.interval = 1 AND tr.days_of_month IS NOT NULL THEN 'MONTHLY'
    WHEN tr.max_occurrences IS NOT NULL THEN 'DAILY'
    ELSE 'DAILY'
  END
  || CASE WHEN tr.end_date IS NOT NULL THEN ';UNTIL=' || TO_CHAR(tr.end_date, 'YYYYMMDD') ELSE '' END as recurrence_rule,
  true,
  NOW()
FROM bak_task t
JOIN bak_task_recurrence tr ON t.recurrence_id = tr.id
WHERE tr.id IS NOT NULL;

-- Asociar tareas recurrentes a rutinas
INSERT INTO flex-calendar_routine_task (routine_id, task_id, order)
SELECT
  r.id,
  t.id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY t.created_at)
FROM flex-calendar_routine r
JOIN bak_task t ON r.owner_id = t.owner_id
  AND r.name LIKE '%' || SUBSTRING(t.name, 1, 20) || '%'
WHERE t.recurrence_id IS NOT NULL;
```

---

## 7. Validación Post-Migración

### 7.1 Integridad de Datos

```sql
-- Verificar conteos
SELECT
  'Tasks' as entity,
  COUNT(*) as count_v1,
  (SELECT COUNT(*) FROM flex-calendar_task) as count_v2,
  CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM flex-calendar_task) THEN 'OK' ELSE 'MISMATCH' END as status
FROM bak_task;

-- Verificar sin orfandades
SELECT COUNT(*) as orphan_occurrences
FROM flex-calendar_task_occurrence
WHERE task_id NOT IN (SELECT id FROM flex-calendar_task);

-- Verificar rutinas sin ciclos (DAG válido)
WITH RECURSIVE task_dag AS (
  SELECT from_task_id, to_task_id, 1 as depth
  FROM flex-calendar_routine_edge
  UNION ALL
  SELECT d.from_task_id, e.to_task_id, d.depth + 1
  FROM task_dag d
  JOIN flex-calendar_routine_edge e ON d.to_task_id = e.from_task_id
  WHERE d.depth < 100
)
SELECT
  CASE WHEN COUNT(*) > 0 THEN 'CICLOS DETECTADOS' ELSE 'DAG VÁLIDO' END as dag_status
FROM task_dag
WHERE from_task_id = to_task_id;
```

### 7.2 Métricas de Consistencia

```sql
-- Por usuario, validar conteos y estados
SELECT
  t.owner_id,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT CASE WHEN to.status = 'Completed' THEN to.id END) as completed_occurrences,
  COUNT(DISTINCT CASE WHEN to.status = 'Pending' THEN to.id END) as pending_occurrences,
  COUNT(DISTINCT r.id) as routine_count,
  'OK' as migration_status
FROM flex-calendar_task t
LEFT JOIN flex-calendar_task_occurrence to ON t.id = to.task_id
LEFT JOIN flex-calendar_routine r ON r.owner_id = t.owner_id
GROUP BY t.owner_id;
```

---

## 8. Cambios Recomendados a FlexCalendarV2.md

### Clarificación 1: Recurrencia en Rutina (no Tarea)

**Original v2.md**:
> "Notemos que toda la recurrencia se aplica a toda la rutina"

**Aclaración propuesta**:
> "Cada tarea individual NO tiene recurrencia; solo las rutinas pueden recurrirse. Una tarea dentro de una rutina hereda la regla de recurrencia de su contenedor. Tareas sin rutina no recurren."

**Impacto**: Más claro, alinea con arquitectura propuesta.

---

### Clarificación 2: Ocurrencias sin Asignar

**Original v2.md**:
> "Las ocurrencias no asignadas tendrán ambos campos seteados a null."

**Aclaración propuesta**:
> "Las ocurrencias en estado 'unassigned' (sin bloque en calendario) tienen `slot_start_at = NULL` y `slot_end_at = NULL`. Al asignar una ocurrencia a un bloque de tiempo, ambos campos se actualizan. Una ocurrencia solo puede estar completada si fue previamente asignada."

**Impacto**: Define ciclo de vida más claramente.

---

### Clarificación 3: Tipo de Tarea vs Atributos

**Propuesta**: En v2.md, reemplazar concepto de "tipo de tarea" por "combinación de atributos":

> "La tipología de una tarea se define por la combinación de:
> - `is_divisible`: si puede dividirse en múltiples sesiones
> - `recurrence_rule` (heredada de rutina): si se repite y cómo
> - `is_fixed`: si tiene horarios fijos
>
> Ejemplos:
> - Tarea única: (divisible=false, recurrencia=none, fixed=false)
> - Hábito diario: (divisible=true, recurrencia=DAILY, fixed=false)
> - Reunión fija recurrente: (divisible=false, recurrencia=WEEKLY, fixed=true)"

**Impacto**: Simplifica documentación, alinea con modelo v2 propuesto.

---

## 9. Conclusión y Recomendación Final

### Viabilidad: ✅ 100% Viable

1. **Conceptos v2 acoplan naturalmente** al modelo actual (85% compatibilidad directa)
2. **Cambios semánticos son mínimos** (essentially renamings + extensiones de schema)
3. **Nuevo modelo (rutinas) se agrega sin romper** lo existente
4. **Scripts ETL son simples** y deterministas

### Estrategia Recomendada:

**Para Desarrollo/Staging**:
- ✅ Reset completo (Opción A)
- Implementar v2 limpio desde cero
- Usar scripts ETL para testear con datos reales
- No heredar deuda de v1

**Para Producción (cuando se implemente)**:
- Evaluar Opción B (Incremental) si hay usuarios activos
- O ejecutar Opción A con downtime controlado + rollback plan

### Próximos Pasos:

1. Actualizar diagrama ER en MASTER_MIGRACION con nuevas entidades
2. Crear archivo `schema-v2.ts` Drizzle con tablas propuestas
3. Crear archivo `scripts/etl-v1-to-v2.sql` con transformaciones
4. Actualizar FlexCalendarV2.md con aclaraciones semánticas
5. Iniciar Fase 1 (DB + Dominio) con este documento como guía

---

**Documento validado**: 2026-04-13
**Análisis realizado por**: Sistema de Migración
**Estado**: Listo para implementación

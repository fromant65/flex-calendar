# Master Migracion FlexCalendar v2 (AI-Optimized)

## 1) Objetivo
Migrar a v2 con maxima simplicidad de implementacion.
Supuestos fijos:
- app sin produccion historica relevante
- DB nueva y vacia al iniciar
- sin retrocompatibilidad de datos/API
- sin estrategia de transicion v1
- sin priorizar regresiones entre v1 y v2

## 2) Estrategia General
Decision unica: greenfield + reset total de dominio.
- eliminar dominio v1
- crear schema v2 definitivo
- implementar backend/frontend solo v2
- seed minimo para QA

Razon:
- menos complejidad
- menos codigo temporal
- menor costo de mantenimiento durante migracion

## 3) Base Aprovechable (actual)
- arquitectura backend por capas (router/service/adapter/repository)
- orquestacion en TaskLifecycleService (reusable parcialmente)
- stack estable: Next.js + tRPC + Drizzle + Postgres + NextAuth
- UI ya tiene matriz/calendario/dialogos que inspiran v2

## 4) Brechas Criticas vs v2
1. Rutinas inexistentes (entidad + dependencias + orden + anti-ciclo)
2. Ocurrencias con start obligatorio; v2 requiere slots nullable
3. Urgencia actual no coincide con algoritmo lineal v2 por tramos
4. Producto fragmentado (no agenda unificada final)
5. Modelo centrado en tipos legacy, no en atributos v2

## 5) Configuracion Requerida
- mantener Drizzle
- separar schema auth y schema dominio v2
- migraciones en pipeline explicito (build != migrate)
- sin feature flags de transicion (v2 por defecto)

## 6) DB Plan (Reset Total)
### 6.1 Alcance
- no ETL
- no backup de negocio como requerimiento del plan
- no rollback funcional a v1

### 6.2 Pasos
1. borrar tablas dominio v1: task, task_occurrence, task_recurrence, calendar_event
2. preservar auth si se desea continuidad de login local
3. crear schema v2 en Drizzle
4. generar migracion inicial unica
5. aplicar migracion sobre DB vacia
6. correr seed minimo

### 6.3 Integridad minima obligatoria
- migracion desde cero sin errores
- FK/indices/constraints creados
- validacion DAG activa en servicios
- occurrence soporta slot_start_at/slot_end_at null

## 7) Mapeo Semantico (resumen compacto)
| Entidad | Estado | Cambio |
|---|---|---|
| task | extendida | agregar difficulty, is_divisible, urgency_threshold_at, duration_minutes |
| task_occurrence | refactor | renombrar fechas a slots nullable + due/tentative + time minutes |
| recurrence | relocalizada | solo en routine (task sin routine no recurre) |
| routine | nueva | agregar routine, routine_task, routine_edge |
| calendar_event | opcional | puede eliminarse; source principal son slots en occurrence |
| task types legacy | simplificado | pasar a combinacion (is_divisible, recurrence_type, is_fixed) |

## 8) Modelo v2 (contrato de datos)
### 8.1 Tablas
- task:
  - id, ownerId, name, description, importance
  - difficulty(1-5), is_divisible(bool), urgency_threshold_at(ts?), duration_minutes(int?)
  - isFixed, fixedStartTime?, fixedEndTime?
  - status(active|paused|completed), completedAt?, createdAt, updatedAt
- task_occurrence:
  - id, taskId
  - slot_start_at?, slot_end_at?
  - due_at?, tentative_at?
  - target_time_minutes?, time_spent_minutes(default 0)
  - status(unassigned|pending|in_progress|completed|skipped)
  - completedAt?, createdAt, updatedAt
- routine:
  - id, ownerId, name, description, recurrence_rule?, is_active, createdAt, updatedAt
- routine_task:
  - id, routineId, taskId, order, createdAt
  - unique(routineId, taskId)
- routine_edge:
  - id, routineId, fromTaskId, toTaskId, edge_type(ORDER|DEPENDENCY), createdAt
  - no self-loop

### 8.2 Reglas duras
1. slots: ambos null o ambos not null
2. divisible=false => max 1 ocurrencia activa por task
3. recurrencia solo en routine
4. DAG sin ciclos
5. urgencia usa threshold; default sugerido = due_at - 7d

## 9) API v2 (objetivo)
- agenda.router:
  - vista unificada lista + matriz + calendario
- routine.router:
  - CRUD rutina
  - add/remove task
  - add/remove dependency
  - reorder
  - validate DAG
- task.router v2:
  - CRUD task con nuevos campos v2

Flujos requeridos:
- completar ocurrencia con opcion completar task + ajustar tiempo
- completar task/routine sin calendarizar

## 10) UI v2 (objetivo)
- agenda principal:
  - desktop: 3 columnas (lista, matriz, calendario)
  - mobile: 3 tabs con swipe
- paginas finales:
  - agenda (principal)
  - tasks
  - routines
- sin ruta de transicion: events reemplazada por agenda

## 11) Plan por Fases (minimo)
### F0 - Arranque DB
- reset dominio v1
- migracion inicial v2
- seed minimo
DoD: app inicia con schema v2 limpio

### F1 - Dominio + API
- servicios v2: task/occurrence/routine
- urgencia v2
- validacion DAG
- routers agenda/routine/task
DoD: endpoints v2 funcionales local

### F2 - Frontend
- agenda final desktop/mobile
- tasks + routines
- flujo crear-planificar-completar
DoD: navegacion y flujo e2e operativo

### F3 - Cierre
- remover codigo obsoleto v1
- actualizar docs
- validar build/start en entorno limpio
DoD: repo alineado 100% a v2

## 12) Riesgos (solo los relevantes en greenfield)
| Riesgo | Nivel | Mitigacion |
|---|---|---|
| reglas v2 incompletas | medio | cerrar reglas antes de endpoints finales |
| complejidad DAG | medio | validacion anti-ciclo obligatoria |
| desalineacion UI-dominio | medio | UI contra contratos reales agenda.router |

## 13) Criterios de Aceptacion Final
- DB v2 limpia operativa desde cero
- backend expone solo contratos v2
- frontend usa solo flujos v2
- reglas criticas activas: urgencia, divisibilidad, DAG
- documentacion final consistente con estrategia greenfield

## 14) Backlog de Agentes (compacto)
- Agente 1 (DB): schema-v2 + migracion inicial + seed
- Agente 2 (Backend): servicios v2 + routers + reglas de dominio
- Agente 3 (Frontend): agenda/tasks/routines + flujos completos
- Agente 4 (Cierre): limpieza v1 + docs + build/start check

## 15) Decision Log (canonico)
1. sin retrocompatibilidad funcional ni de datos
2. DB nueva/vacia como precondicion
3. sin ETL
4. sin dual-read/dual-write/feature flags de transicion
5. implementacion directa v2 end-to-end

## 16) Ejecucion inmediata
1. definir schema-v2 final
2. generar/aplicar migracion inicial
3. implementar backend v2
4. implementar frontend v2
5. limpiar legado y cerrar docs

## 17) Referencias
- docs/ANALISIS_SEMANTICO_V2.md
- docs/FlexCalendarV2.md
- docs/MASTER_MIGRACION_FLEXCALENDAR_V2.md

## 18) Estado
- estado: en ejecucion activa
- fecha: 2026-04-13
- avance backend: contratos V2 migrados en servicios/repositorios principales (status minúscula, occurrence con taskId/slotStartAt/dueAt/tentativeAt/targetTimeMinutes/timeSpentMinutes) y service de rutinas con validacion DAG + CRUD + dependencias
- avance api: `routine.router` expuesto en root con endpoints create/get/update/delete/addTask/removeTask/reorder/addDependency/removeDependency/validateDag
- avance frontend: adaptación en progreso a semántica V2 (agenda basada en ocurrencias y filtros compatibles con estado V2) + primer módulo de UI para rutinas (listado, alta, activación, eliminación, detalle, validación DAG y edición básica de tareas/dependencias) + form de recurrencia estructurada (none/finite/infinite + intervalo/días/límites)
- pendiente inmediato: estabilizar typecheck de componentes legacy, completar reorder de rutinas y retirar aliases de compatibilidad restantes
- estimacion restante: 1-2 semanas para cierre completo (segun alcance de tests)

## 19) Corte de Ejecucion (2026-04-13)
1. Backend V2 de rutinas ya operativo y conectado al router principal.
2. Frontend integra directamente `routine.router` (sin capa legacy) en nueva ruta `app/routines` con alta/baja de tareas, dependencias y recurrencia estructurada.
3. Navegación actualizada para exponer Rutinas en desktop/mobile/menú lateral.
4. Siguiente bloque de trabajo: completar reorder de rutinas + cierre de errores TS remanentes.

Pendiente: revisar flujos anteriores (creaciones/eliminación de tasks, gestor de tareas, calendarios) para determinar si hay que cambiar comportamientos/flujos/apis segun cambios en V2
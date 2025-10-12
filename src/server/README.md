# Flex Calendar - Backend API

API backend para el sistema de gestión de tareas flexible con calendario integrado.

## Arquitectura

La API sigue una arquitectura en capas con separación clara de responsabilidades:

```
src/server/
├── api/
│   ├── routers/         # Capa de aplicación - tRPC routers
│   ├── services/        # Capa de lógica de negocio
│   ├── adapter/         # Capa de adaptación entre servicios y repositorios
│   └── repository/      # Capa de acceso a datos
├── db/
│   ├── schema.ts        # Definición de esquemas de base de datos
│   └── index.ts         # Configuración de conexión a DB
└── auth/                # Configuración de autenticación
```

## Modelos de Datos

### Task (Tarea)
- `id`: Identificador único
- `ownerId`: Usuario propietario
- `name`: Nombre de la tarea
- `description`: Descripción (opcional)
- `recurrenceId`: Referencia a patrón de recurrencia (opcional)
- `importance`: Nivel de importancia (1-10)
- `isActive`: Estado activo/inactivo

### TaskRecurrence (Recurrencia)
- `id`: Identificador único
- `creationDate`: Fecha de creación
- `interval`: Intervalo entre ocurrencias (días)
- `daysOfWeek`: Días específicos de la semana
- `daysOfMonth`: Días específicos del mes
- `maxOccurrences`: Número máximo de ocurrencias
- `endDate`: Fecha de fin de la recurrencia

### TaskOccurrence (Ocurrencia)
- `id`: Identificador único
- `associatedTaskId`: Tarea asociada
- `startDate`: Fecha de inicio
- `limitDate`: Fecha límite (opcional)
- `targetDate`: Fecha objetivo (opcional)
- `targetTimeConsumption`: Tiempo estimado (horas)
- `timeConsumed`: Tiempo dedicado (horas)
- `status`: Estado ('Pending', 'In Progress', 'Completed', 'Skipped')
- `urgency`: Urgencia calculada

### CalendarEvent (Evento de Calendario)
- `id`: Identificador único
- `context`: Contexto o notas
- `ownerId`: Usuario propietario
- `associatedOccurrenceId`: Ocurrencia asociada (opcional)
- `isFixed`: Si es evento fijo o móvil
- `start`: Fecha y hora de inicio
- `finish`: Fecha y hora de fin
- `isCompleted`: Estado de completitud
- `dedicatedTime`: Tiempo dedicado (horas)

## Servicios

### TaskLifecycleService
Gestión del ciclo de vida completo de tareas, ocurrencias y eventos.

**Operaciones principales:**
- CRUD de tareas
- CRUD de ocurrencias
- CRUD de eventos de calendario
- Completar/saltar ocurrencias
- Sincronización de tiempos consumidos

### TaskSchedulerService
Gestión de recurrencias y creación automática de ocurrencias.

**Funcionalidades:**
- Calcular próxima fecha de ocurrencia según patrón de recurrencia
- Crear automáticamente siguiente ocurrencia al completar/saltar anterior
- Verificar límites de recurrencia (maxOccurrences, endDate)
- Soporta patrones: intervalo, días de semana, días de mes

### TaskAnalyticsService
Cálculo de urgencia y generación de estadísticas.

**Algoritmo de urgencia:**
- **0-5**: Antes de fecha objetivo
  - Urgencia = 5 × (tiempo transcurrido / tiempo restante)
  - A medida que nos acercamos al objetivo, la urgencia aumenta
  - Ejemplo: Si han pasado 3 días desde la creación y quedan 3 días hasta el objetivo, urgencia = 5
- **5-10**: Entre fecha objetivo y límite
  - Aumenta linealmente según el progreso en este rango
- **>10**: Después de fecha límite (tarea vencida)
  - Urgencia = 10 + (días vencidos × 0.5), máximo 20

**Estadísticas disponibles:**
- Total de tareas
- Tareas activas
- Ocurrencias completadas/pendientes
- Tiempo total dedicado
- Tasa promedio de completitud

## API tRPC

### Router: `task`

#### Queries
- `getById(id)`: Obtener tarea por ID
- `getWithDetails(id)`: Obtener tarea con recurrencia y próxima ocurrencia
- `getMyTasks()`: Obtener todas las tareas del usuario
- `getMyActiveTasks()`: Obtener tareas activas del usuario
- `getMyStatistics()`: Obtener estadísticas del usuario
- `getByUrgency()`: Obtener ocurrencias ordenadas por urgencia

#### Mutations
- `create(data)`: Crear nueva tarea
- `update(id, data)`: Actualizar tarea
- `delete(id)`: Eliminar tarea (soft delete)

### Router: `occurrence`

#### Queries
- `getById(id)`: Obtener ocurrencia por ID
- `getWithTask(id)`: Obtener ocurrencia con detalles de tarea
- `getByTaskId(taskId)`: Obtener todas las ocurrencias de una tarea
- `getByDateRange(startDate, endDate)`: Obtener ocurrencias en rango de fechas

#### Mutations
- `create(data)`: Crear nueva ocurrencia manualmente
- `update(id, data)`: Actualizar ocurrencia
- `complete(id)`: Marcar ocurrencia como completada
- `skip(id)`: Marcar ocurrencia como saltada

### Router: `calendarEvent`

#### Queries
- `getById(id)`: Obtener evento por ID
- `getWithDetails(id)`: Obtener evento con detalles de ocurrencia y tarea
- `getMyEvents()`: Obtener todos los eventos del usuario
- `getMyEventsWithDetails()`: Obtener eventos con detalles completos
- `getByDateRange(startDate, endDate)`: Obtener eventos en rango de fechas

#### Mutations
- `create(data)`: Crear nuevo evento
- `update(id, data)`: Actualizar evento
- `complete(id)`: Marcar evento como completado (calcula tiempo dedicado)
- `delete(id)`: Eliminar evento

## Uso de la API

### Crear una tarea única

```typescript
const task = await trpc.task.create.mutate({
  name: "Estudiar para examen",
  description: "Repasar capítulos 3-5",
  importance: 8,
});
```

### Crear una tarea con recurrencia (hábito)

```typescript
const habitTask = await trpc.task.create.mutate({
  name: "Ejercicio diario",
  importance: 9,
  recurrence: {
    daysOfWeek: ["Mon", "Wed", "Fri"],
  },
});
```

### Completar una ocurrencia

```typescript
// Marca como completada y crea automáticamente la siguiente si es recurrente
await trpc.occurrence.complete.mutate({ id: occurrenceId });
```

### Crear un evento de calendario

```typescript
const event = await trpc.calendarEvent.create.mutate({
  context: "Sesión de estudio",
  associatedOccurrenceId: occurrenceId,
  isFixed: true,
  start: new Date("2025-10-15T10:00:00"),
  finish: new Date("2025-10-15T12:00:00"),
});
```

### Obtener tareas ordenadas por urgencia

```typescript
const urgentTasks = await trpc.task.getByUrgency.query();
```

## Migraciones de Base de Datos

Para generar y aplicar migraciones:

```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Push directo a DB (desarrollo)
npm run db:push

# Abrir Drizzle Studio
npm run db:studio
```

## Próximos Pasos (Fuera del MVP)

- [ ] Soporte para topologías avanzadas (Rutina, Árbol, Grafo)
- [ ] Gestión de múltiples actores (responsables y colaboradores)
- [ ] Cronómetro integrado para medir tiempo dedicado
- [ ] Notificaciones y recordatorios
- [ ] Vista de Eisenhower (matriz urgencia/importancia)
- [ ] Sincronización con calendarios externos
- [ ] Análisis y reportes avanzados

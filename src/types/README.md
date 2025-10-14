# Guía de Tipos - Flex Calendar

## Arquitectura de Tipos

Este proyecto sigue una arquitectura de tres capas para los tipos de datos:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/UI)                       │
│                  Importa desde ~/types                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Router/API Boundary (tRPC)                      │
│                   src/types/index.ts                         │
│        (Tipos compartidos Frontend ↔ Backend)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          Backend Internal (Services/Repositories)            │
│           src/server/api/services/types.ts                   │
│     (Tipos internos del backend - NO TOCAR desde UI)        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Ubicación de Tipos

### `src/types/index.ts` ✅ **ÚNICA FUENTE DE VERDAD**
- **Propósito**: Tipos compartidos entre frontend y backend a nivel de API
- **Usado por**: Componentes de React, tRPC routers, endpoints
- **Incluye**:
  - Entidades base: `Task`, `TaskRecurrence`, `TaskOccurrence`, `CalendarEvent`
  - Entidades extendidas: `TaskWithDetails`, `TaskWithRecurrence`, `OccurrenceWithTask`, `EventWithDetails`
  - DTOs: `CreateTaskDTO`, `UpdateTaskDTO`, etc.
  - Tipos literales: `TaskType`, `TaskOccurrenceStatus`, `DayOfWeek`, `CalendarView`
  - Tipos de UI: `QuadrantPosition`

### `src/server/api/services/types.ts` ⚠️ **SOLO BACKEND**
- **Propósito**: Tipos internos del backend
- **Usado por**: Services, Repositories, Adapters
- **NO importar desde**: Frontend, componentes de React
- **Mantener sincronizado con**: `src/types/index.ts` para entidades públicas

### `src/server/api/routers/endpoints.types.ts`
- **Propósito**: Tipos derivados de endpoints tRPC
- **Generados automáticamente** de los schemas Zod en los routers
- **No editar manualmente** - solo para referencia

## 🚫 Anti-patrones a EVITAR

### ❌ NO definir tipos locales duplicados
```tsx
// ❌ MAL - Tipo local duplicado
type TaskType = "Única" | "Recurrente Finita" | "Hábito" | "Hábito +"

// ✅ BIEN - Importar desde types
import type { TaskType } from "~/types"
```

### ❌ NO definir interfaces duplicadas
```tsx
// ❌ MAL - Interface local duplicada
interface TaskWithRecurrence {
  id: number
  name: string
  // ...
}

// ✅ BIEN - Importar desde types
import type { TaskWithRecurrence } from "~/types"
```

### ❌ NO importar desde paths antiguos
```tsx
// ❌ MAL - Path antiguo (eliminado)
import type { Task } from "~/lib/types"

// ✅ BIEN - Path centralizado
import type { Task } from "~/types"
```

## ✅ Patrones Correctos

### Componentes de React
```tsx
import type { TaskWithRecurrence, EventWithDetails } from "~/types"

interface MyComponentProps {
  task: TaskWithRecurrence
  onUpdate: (task: TaskWithRecurrence) => void
}
```

### Tipos de formulario internos
```tsx
// ✅ BIEN - Tipo interno específico del componente
type FormTaskType = "unique" | "finite" | "habit" | "habit-plus" | "fixed-unique" | "fixed-repetitive"

// Este tipo es diferente del TaskType público y solo se usa internamente en el formulario
```

### Tipos Parciales
```tsx
import type { TaskWithRecurrence } from "~/types"

interface ModalProps {
  task?: Partial<TaskWithRecurrence> | null
  // Usar Partial<T> para objetos opcionales/incompletos
}
```

## 📚 Tipos Principales

### Entidades Base
- `Task` - Tarea básica
- `TaskRecurrence` - Configuración de recurrencia
- `TaskOccurrence` - Instancia/ocurrencia de una tarea
- `CalendarEvent` - Evento en el calendario

### Entidades Extendidas
- `TaskWithRecurrence` - Tarea + recurrencia (opcional)
- `TaskWithDetails` - Tarea + recurrencia + próxima ocurrencia + tipo calculado
- `OccurrenceWithTask` - Ocurrencia + tarea asociada
- `EventWithDetails` - Evento + ocurrencia + tarea

### Tipos Literales
- `TaskType` - "Única" | "Recurrente Finita" | "Hábito" | "Hábito +" | "Fija Única" | "Fija Repetitiva"
- `TaskOccurrenceStatus` - "Pending" | "In Progress" | "Completed" | "Skipped"
- `DayOfWeek` - "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
- `CalendarView` - "day" | "week" | "month"

### DTOs (Data Transfer Objects)
- `CreateTaskDTO` - Input para crear tarea
- `UpdateTaskDTO` - Input para actualizar tarea
- `CreateRecurrenceDTO` - Input para crear recurrencia
  - ⚠️ **IMPORTANTE**: `endDate` es **REQUERIDO** para tareas fijas repetitivas (cuando `isFixed=true` y se define `daysOfWeek` o `daysOfMonth`)
- `CreateOccurrenceDTO` - Input para crear ocurrencia
- `UpdateOccurrenceDTO` - Input para actualizar ocurrencia
- `CreateCalendarEventDTO` - Input para crear evento
- `UpdateCalendarEventDTO` - Input para actualizar evento

## ⚠️ Restricciones Importantes

### Tareas Fijas Repetitivas
Las tareas con `isFixed: true` y recurrencia (daysOfWeek o daysOfMonth) **DEBEN** tener:
1. `fixedStartTime` - Hora de inicio (formato: "HH:MM:SS")
2. `fixedEndTime` - Hora de fin (formato: "HH:MM:SS")
3. `recurrence.endDate` - Fecha de finalización (**OBLIGATORIA** para evitar generar eventos infinitamente)

```tsx
// ✅ CORRECTO - Tarea fija repetitiva con endDate
const task: CreateTaskDTO = {
  name: "Reunión diaria",
  isFixed: true,
  fixedStartTime: "09:00:00",
  fixedEndTime: "09:30:00",
  recurrence: {
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    endDate: new Date("2025-12-31") // OBLIGATORIO
  }
}

// ❌ INCORRECTO - Sin endDate generará error
const task: CreateTaskDTO = {
  name: "Reunión diaria",
  isFixed: true,
  fixedStartTime: "09:00:00",
  fixedEndTime: "09:30:00",
  recurrence: {
    daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    // ❌ Falta endDate - el backend rechazará esta tarea
  }
}
```

## 🔧 Mantenimiento

### Al agregar un nuevo tipo:
1. ¿Es compartido entre frontend y backend? → `src/types/index.ts`
2. ¿Es solo para backend interno? → `src/server/api/services/types.ts`
3. ¿Es específico de un componente? → Definir localmente en el componente

### Al modificar un tipo existente:
1. Buscar todas las importaciones: `grep -r "import.*<TipeName>"`
2. Actualizar el tipo en `src/types/index.ts`
3. Si existe en `services/types.ts`, mantener sincronizado
4. Verificar errores de TypeScript: `npx tsc --noEmit`

### Verificación de salud de tipos:
```bash
# Buscar tipos duplicados
grep -r "^type Task" src/
grep -r "^interface Task" src/

# Buscar imports del path antiguo
grep -r "from [\"']~/lib/types[\"']" src/

# Verificar errores de TypeScript
npx tsc --noEmit
```

## 📝 Convenciones

1. **Naming**: 
   - Tipos literales en español: `TaskType = "Única" | "Hábito"`
   - Interfaces en inglés: `TaskWithDetails`, `OccurrenceWithTask`
   - DTOs con sufijo DTO: `CreateTaskDTO`, `UpdateTaskDTO`

2. **Exports**:
   - Siempre usar `export type` o `export interface`
   - Nunca usar `export default` para tipos

3. **Imports**:
   - Siempre usar `import type` cuando solo se importan tipos
   - Usar path alias: `~/types` en lugar de rutas relativas

4. **Documentación**:
   - Agregar JSDoc comments a tipos complejos
   - Mantener este README actualizado con cambios importantes

## 🎯 Beneficios de esta Arquitectura

- ✅ **Única fuente de verdad**: No más tipos duplicados o inconsistentes
- ✅ **Mejor mantenibilidad**: Cambios en un solo lugar
- ✅ **Type safety**: TypeScript garantiza coherencia en toda la app
- ✅ **Refactoring seguro**: Renombrar tipos con confianza
- ✅ **Menor superficie de cambios**: Menos archivos que modificar
- ✅ **Mejor DX**: Autocompletado consistente en todo el proyecto

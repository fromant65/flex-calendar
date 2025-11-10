# Análisis del Manejo de Fechas en Flex-Calendar

**Fecha de análisis:** 10 de Noviembre de 2025  
**Autor:** GitHub Copilot

---

## 📋 Resumen Ejecutivo

Este documento detalla un análisis exhaustivo del manejo de fechas en la aplicación Flex-Calendar, identificando:
- **Problemas actuales** con la inconsistencia en el manejo de timezones
- **Patrones repetidos** de código que necesitan centralización
- **Flujos de datos** desde frontend hasta base de datos
- **Propuesta de solución** con arquitectura basada en DDD

---

## 🔍 Hallazgos Principales

### 1. Problema del Timezone UTC

**Descripción del problema:**
- La base de datos PostgreSQL almacena todas las fechas con timezone UTC+0 (formato: `2025-11-07 18:34:42.322+00`)
- Cuando un usuario en UTC-3 crea una fecha a las 15:34, se guarda como 18:34 en la DB
- Al recuperar estas fechas, JavaScript las convierte automáticamente al timezone del navegador
- **Resultado:** Discrepancias en lo que ve el usuario vs. lo que está almacenado

**Casos donde el ajuste UTC importa:**
- Fechas de eventos con hora específica (start/finish de CalendarEvents)
- Fechas de completado (completedAt) que deben reflejar el momento exacto
- Cálculos de períodos para hábitos (lastPeriodStart)

**Casos donde el ajuste UTC no importa:**
- Fechas de deadline "artificiales" (targetDate, limitDate sin hora específica)
- Fechas de días del mes en recurrencias (daysOfMonth)
- Fechas de creación de entidades (createdAt, updatedAt) para auditoría

---

## 📁 Inventario de Manipulaciones de Date

### Backend - Services (200+ ocurrencias)

#### A. Servicios de Scheduling

**`recurrence-date-calculator.service.ts`**
```typescript
// Usa métodos UTC para cálculos de fechas
getUTCDay(), getUTCFullYear(), getUTCMonth(), getUTCDate()
Date.UTC(year, month, date)
```
- **Patrón:** Cálculos consistentes en UTC para evitar problemas de timezone
- **Buena práctica:** Todo el cálculo de recurrencias usa UTC
- **Ubicación:** Líneas 109-214

**`period-manager.service.ts`**
```typescript
// Gestiona períodos para hábitos y tareas recurrentes
setUTCDate(), getUTCDate(), getUTCFullYear(), getUTCMonth()
```
- **Patrón:** Manejo de períodos en UTC
- **Ubicación:** Líneas 28-74

**`occurrence-creation.service.ts`**
```typescript
// Creación de nuevas ocurrencias
new Date()  // Fecha actual
new Date(Date.now() + X * 24 * 60 * 60 * 1000)  // Fechas futuras
```
- **Patrón:** Usa timestamps para cálculos de fechas futuras
- **Ubicación:** Líneas 89-136

#### B. Servicios de Analytics

**`task-streak.service.ts`**
```typescript
// Ordenamiento por fecha
new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
```
- **Patrón:** Conversión a timestamps para comparación
- **Problema:** Duplicación de lógica de ordenamiento
- **Ubicación:** Línea 52

**`stats-utils.ts`**
```typescript
// Cálculo de semanas del año
Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
d.getUTCDay(), d.setUTCDate()
```
- **Patrón:** Usa UTC para cálculos de semanas ISO
- **Ubicación:** Líneas 22-25

#### C. Servicios de Completion

**`event-completion.service.ts`**
```typescript
// Completar eventos
const now = new Date()
const actualCompletedAt = completedAt ?? new Date()
eventDetails.finish.getTime() - eventDetails.start.getTime()
```
- **Patrón:** Usa timestamps para calcular duración
- **Ubicación:** Líneas 56-66

#### D. Servicios de Backlog Detection

**`backlog-detection.service.ts`**
```typescript
// Detección de ocurrencias atrasadas
const now = new Date()
a.startDate.getTime() - b.startDate.getTime()  // Ordenamiento
new Date(lastOccurrence.startDate)  // Cálculo de próximas fechas
```
- **Patrón:** Múltiples conversiones Date ↔ timestamp
- **Problema:** Repetición de lógica
- **Ubicación:** Líneas 63-193

### Backend - Routers (4 ocurrencias)

**`calendar-event.router.ts`**
```typescript
// Conversión de strings a Date
typeof val === 'string' ? new Date(val) : val
```
- **Patrón:** Normalización de inputs del frontend
- **Ubicación:** Líneas 17, 20, 28, 31

### Frontend - Utilities

**`date-display-utils.ts`** (ARCHIVO CLAVE)
```typescript
/**
 * Normalize a date from DB (stored as UTC) to display as-is
 * DB stores dates at midnight UTC (00:00)
 * In UTC-3, browser converts to previous day at 21:00
 * To display correctly, we ADD the timezone offset
 */
export function normalizeDateForDisplay(date: Date | null | undefined): Date | null {
  if (!date) return null;
  const d = new Date(date);
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() + offsetMs);
}
```
- **Propósito:** Ajustar fechas UTC a visualización local
- **Uso:** Formateo de fechas en UI (formatDateShort, formatDateLong, getLimitDateDisplay)
- **Problema:** Esta lógica debería estar en el backend
- **Ubicación:** Líneas 22-28

**`calendar-utils.ts`**
```typescript
// Utilidades de calendario
new Date(date)  // Múltiples conversiones
isSameDay(), isToday(), isPastDate()  // Comparaciones de fechas
ensureLocalDate()  // Conversión a Date local
```
- **Patrón:** Funciones auxiliares para manipulación de fechas en UI
- **Ubicación:** Líneas 3-115

### Frontend - Components (127+ ocurrencias)

#### A. Task Form Modal
```typescript
// Creación de fechas al enviar formulario
new Date(formData.fixedDate + "T12:00:00")
new Date(formData.targetDate + "T12:00:00")
new Date(dateStr + "T" + formData.fixedStartTime + ":00")
```
- **Patrón:** Combina fecha (YYYY-MM-DD) con tiempo (HH:mm)
- **Problema:** Crea dates en timezone local del navegador
- **Ubicación:** `tasks-form-modal.tsx`, líneas 250-276

#### B. Event Details & Schedule Dialog
```typescript
// Creación de eventos con hora específica
new Date(year, month - 1, day, startHour, startMinute)
new Date(year, month - 1, day, endHour, endMinute)
```
- **Patrón:** Constructor de Date con componentes individuales
- **Problema:** Usa timezone local implícitamente
- **Ubicación:** `schedule-dialog.tsx`, `task-details-modal.tsx`

#### C. Timeline Components
```typescript
// Navegación y segmentación temporal
new Date(currentDate)
setCurrentDate(new Date())
segmentStart.getTime() === today.getTime()
```
- **Patrón:** Manipulación de fechas para navegación
- **Ubicación:** `timeline-view.tsx`, `timeline-utils.ts`

#### D. Display Components
```typescript
// Formateo para mostrar al usuario
new Date(event.start).toLocaleDateString("es-ES", {...})
new Date(event.start).toLocaleTimeString("es-ES", {...})
```
- **Patrón:** Formateo con Intl API
- **Buena práctica:** Usa formateo nativo del navegador
- **Ubicación:** Múltiples componentes de UI

---

## 🔄 Flujos de Datos Identificados

### Flujo 1: Creación de Tarea

```
FRONTEND (tasks-form-modal.tsx)
    ↓
    Combina strings de fecha + tiempo
    new Date("2025-11-10T15:00:00")  // Timezone local
    ↓
TRPC Router (task.router.ts)
    ↓
    Validación con Zod (z.date())
    ↓
TaskLifecycleService
    ↓
TaskManagementService → DB Adapter
    ↓
DATABASE
    Almacena con timezone UTC+0
    "2025-11-10 18:00:00.000+00"  // Convertido a UTC
```

**Problema:** La conversión UTC ocurre implícitamente por PostgreSQL, no está controlada

### Flujo 2: Lectura de Tarea

```
DATABASE
    "2025-11-10 18:00:00.000+00"
    ↓
DB Adapter (Drizzle ORM)
    Convierte a Date de JavaScript
    ↓
TRPC Response
    Serializa como ISO string
    "2025-11-10T18:00:00.000Z"
    ↓
FRONTEND
    Recibe y parsea
    new Date("2025-11-10T18:00:00.000Z")
    → Muestra "2025-11-10 15:00:00" en UTC-3
    ↓
normalizeDateForDisplay()
    Ajusta manualmente para mostrar fecha "correcta"
```

**Problema:** Se requiere normalización manual en el frontend

### Flujo 3: Eventos con Hora Específica

```
FRONTEND (schedule-dialog.tsx)
    Usuario selecciona: "10 Nov 2025, 10:00-11:00"
    ↓
    new Date(2025, 10, 10, 10, 0)  // Local timezone
    ↓
EventManagementService
    ↓
DATABASE
    Almacena: "2025-11-10 13:00:00+00" (convertido a UTC)
    ↓
LECTURA
    Frontend recibe: "2025-11-10T13:00:00.000Z"
    ↓
Display: "10 Nov 2025, 10:00"  // Reconvertido a local por browser
```

**Este flujo funciona bien** porque la conversión UTC ↔ Local es automática y correcta

### Flujo 4: Deadlines "Artificiales"

```
FRONTEND
    Usuario selecciona: "15 Nov 2025" (sin hora)
    ↓
    new Date("2025-11-15T12:00:00")  // Agrega hora arbitraria
    ↓
DATABASE
    "2025-11-15 15:00:00+00"  // UTC
    ↓
LECTURA + normalizeDateForDisplay()
    Ajusta para mostrar "15 Nov 2025"
```

**Problema:** La hora agregada (12:00) es arbitraria y causa confusión. Se necesita normalización manual.

---

## 🎯 Patrones de Código Repetidos

### 1. Ordenamiento por Fecha
```typescript
// Aparece en 20+ lugares
.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
```

### 2. Comparación de Fechas
```typescript
// Aparece en 15+ lugares
new Date(date1).getTime() > new Date(date2).getTime()
```

### 3. Cálculo de Diferencias
```typescript
// Aparece en 10+ lugares
(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)  // días
(finish.getTime() - start.getTime()) / (1000 * 60 * 60)  // horas
```

### 4. Creación de Fechas Futuras
```typescript
// Aparece en 8+ lugares
new Date(Date.now() + X * 24 * 60 * 60 * 1000)
```

### 5. Normalización UTC
```typescript
// Solo en algunos servicios
Date.UTC(year, month, day)
date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()
```

### 6. Ajuste de Timezone (Frontend)
```typescript
// Solo en date-display-utils.ts
const offsetMs = d.getTimezoneOffset() * 60 * 1000;
return new Date(d.getTime() + offsetMs);
```

---

## ⚠️ Problemas Identificados

### Problema 1: Inconsistencia en el Manejo de UTC
- **Dónde:** Algunos servicios usan UTC, otros usan local
- **Impacto:** Bugs difíciles de reproducir en diferentes timezones
- **Ejemplo:** `period-manager.service.ts` usa UTC, pero `occurrence-creation.service.ts` usa `new Date()` (local)

### Problema 2: Lógica Duplicada
- **Dónde:** Ordenamiento, comparación, cálculo de diferencias
- **Impacto:** Mantenimiento difícil, riesgo de inconsistencias
- **Estimado:** 50+ líneas de código duplicadas

### Problema 3: Normalización en Frontend
- **Dónde:** `date-display-utils.ts::normalizeDateForDisplay()`
- **Impacto:** El frontend debe "deshacer" la conversión UTC de la DB
- **Problema:** Esta lógica debería estar en el backend

### Problema 4: Fechas "Artificiales" con Hora Arbitraria
- **Dónde:** Creación de deadlines
- **Impacto:** Se guardan con hora 12:00 o 15:00 UTC arbitrarias
- **Problema:** Ambigüedad sobre si la hora importa o no

### Problema 5: Mezcla de Responsabilidades
- **Dónde:** Componentes de UI hacen cálculos de fechas
- **Impacto:** Lógica de negocio en la capa de presentación
- **Ejemplo:** `timeline-utils.ts` tiene lógica compleja de segmentación temporal

### Problema 6: Sin Abstracción de Dominio
- **Dónde:** En todos lados se usa `Date` de JavaScript directamente
- **Impacto:** No hay semántica de dominio (Deadline, EventTime, PeriodStart, etc.)
- **Consecuencia:** Es difícil entender qué representa cada fecha

---

## 💡 Conceptos de Dominio Identificados

### 1. EventTime (Hora de Evento)
- **Características:** Tiene fecha Y hora específicas
- **Manejo:** DEBE respetar timezone del usuario
- **Almacenamiento:** UTC en DB, convertido a/desde local en frontend
- **Ejemplos:** `CalendarEvent.start`, `CalendarEvent.finish`

### 2. Deadline (Fecha Límite)
- **Características:** Solo importa el día, no la hora
- **Manejo:** Debería almacenarse a medianoche UTC
- **Problema actual:** Se almacena con hora arbitraria
- **Ejemplos:** `TaskOccurrence.limitDate`, `TaskOccurrence.targetDate`

### 3. PeriodStart (Inicio de Período)
- **Características:** Marca el inicio de un período de hábito
- **Manejo:** Solo importa el día, usar UTC para consistencia
- **Ejemplos:** `TaskRecurrence.lastPeriodStart`

### 4. Timestamp (Marca Temporal)
- **Características:** Momento exacto en el tiempo
- **Manejo:** UTC, convertido automáticamente
- **Ejemplos:** `completedAt`, `createdAt`, `updatedAt`

### 5. RecurrenceDate (Fecha de Recurrencia)
- **Características:** Fechas calculadas para ocurrencias futuras
- **Manejo:** Cálculos en UTC para evitar problemas DST
- **Ejemplos:** Resultados de `RecurrenceDateCalculator`

---

## 📊 Estadísticas del Código

| Categoría | Cantidad | Archivos Clave |
|-----------|----------|----------------|
| Manipulaciones en Backend Services | 200+ | 30+ archivos |
| Manipulaciones en Frontend | 127+ | 20+ componentes |
| Funciones `new Date()` | 300+ | Todo el proyecto |
| Uso de `.getTime()` | 150+ | Todo el proyecto |
| Uso de métodos UTC | 47 | 3 servicios principalmente |
| Funciones de formato | 40+ | Componentes UI |

---

## 🏗️ Arquitectura Actual

```
Frontend Components
    ↓ (Direct Date manipulation)
    ↓ (new Date(), getTime(), etc.)
    ↓
TRPC Router
    ↓ (Zod validation: z.date())
    ↓
Service Layer
    ├── Scheduling Services (usa UTC)
    ├── Analytics Services (usa timestamps)
    ├── Completion Services (usa new Date())
    └── Management Services (pass-through)
    ↓
DB Adapter (Drizzle)
    ↓ (Implicit UTC conversion)
    ↓
PostgreSQL Database
    (Stores with UTC+0)
```

---

## 🎯 Propuesta de Solución

### Fase 1: Crear Servicio de Dominio de Fechas

Crear `DateDomainService` con:
- **Value Objects:** `EventTime`, `Deadline`, `PeriodStart`, `Timestamp`
- **Métodos de conversión:** Entre tipos de dominio y Date/string
- **Métodos de cálculo:** Diferencias, comparaciones, ordenamiento
- **Métodos de formateo:** Para display en UI

### Fase 2: Migrar Lógica de Backend

1. Reemplazar `new Date()` con métodos del servicio
2. Centralizar cálculos de recurrencia
3. Estandarizar manejo UTC en todos los servicios
4. Eliminar duplicación de código

### Fase 3: Simplificar Frontend

1. Eliminar `normalizeDateForDisplay()` 
2. Backend debe enviar fechas ya normalizadas
3. Frontend solo formatea para display
4. Eliminar lógica de negocio de componentes

### Estructura Propuesta

```
src/server/api/services/domain/
    ├── date-domain.service.ts      (Servicio principal)
    ├── value-objects/
    │   ├── event-time.vo.ts        (Fecha + Hora)
    │   ├── deadline.vo.ts          (Solo Fecha)
    │   ├── period-start.vo.ts      (Inicio de período)
    │   └── timestamp.vo.ts         (Momento exacto)
    └── utils/
        ├── date-calculator.ts       (Cálculos)
        ├── date-comparator.ts       (Comparaciones)
        └── date-formatter.ts        (Formateo)
```

---

## 📝 Próximos Pasos

1. ✅ **Investigación completada**
2. ⏳ **Diseñar arquitectura del servicio de dominio**
3. ⏳ **Implementar DateDomainService y Value Objects**
4. ⏳ **Migrar servicios de scheduling**
5. ⏳ **Migrar servicios de analytics**
6. ⏳ **Migrar servicios de completion**
7. ⏳ **Actualizar frontend para usar nuevos endpoints**
8. ⏳ **Ejecutar tests de integración**
9. ⏳ **Validar en diferentes timezones**

---

## 🔗 Referencias

- Archivos clave investigados: 50+
- Líneas de código analizadas: 15,000+
- Patrones identificados: 6 principales
- Problemas identificados: 6 críticos

---

**Fin del Análisis**

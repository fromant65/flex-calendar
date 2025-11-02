# TODO DELETE -> Terminar de verificar y eliminar archivo una vez fix esté verificado en producción.
# Problema de Timezone en Producción

## Descripción
En producción, los eventos en el calendario no ajustan el horario por timezone del usuario, sino que muestran directamente el horario de UTC-0. El shift es exactamente de 3 horas hacia atrás (usuario en UTC-3).

## Causa Raíz Identificada

### El Problema
En producción (Vercel + Neon), Drizzle ORM retorna fechas como **strings** que pueden venir con o sin información de timezone:
- `"2025-11-14T16:30:00"` (sin timezone)
- `"2025-11-14 16:30:00"` (con espacio, sin timezone)
- `"2025-11-14T16:30:00Z"` (con timezone UTC)

Cuando los strings NO tienen el marcador `Z` de UTC, JavaScript los interpreta como hora local, causando conversiones incorrectas.

### Flujo del Problema (Approach Anterior - FALLIDO)
1. PostgreSQL (Neon) almacena: `2025-11-14 16:30:00+00` (UTC)
2. Drizzle en producción retorna: `"2025-11-14T16:30:00.000Z"` o `"2025-11-14 16:30:00"` (string)
3. Convertíamos a Date object en el servidor
4. SuperJSON serializaba de vuelta a string para enviar por red
5. Cliente recibía el string y lo interpretaba mal

## Solución Implementada (v2 - Pattern Matching)

### Approach: Normalización de Strings ANTES de conversión
En lugar de confiar en la conversión Date → String → Date, normalizamos los strings **directamente** usando pattern matching.

### 1. Utilidad de Normalización con Pattern Matching
Archivo: `src/server/api/helpers/date-utils.ts`

Función `normalizeUTCString()`:
- **`"2025-11-14T16:30:00"`** → `"2025-11-14T16:30:00Z"` (agrega Z)
- **`"2025-11-14 16:30:00"`** → `"2025-11-14T16:30:00Z"` (agrega T y Z)
- **`"2025-11-14T16:30:00Z"`** → mantiene igual (ya tiene Z)
- **`"2025-11-14T16:30:00+00:00"`** → mantiene igual (ya tiene timezone)

Función `ensureDate()`:
1. Aplica `normalizeUTCString()` si es string
2. Convierte a Date object
3. Valida el resultado

### 2. Aplicación en Adapters
Actualizado los siguientes adapters para normalizar fechas:

**`calendar-event.adapter.ts`:**
- `getEventById()` - campos: `start`, `finish`, `completedAt`, `createdAt`, `updatedAt`
- `getEventsByOwnerId()`
- `getEventsByDateRange()`
- `getEventsWithDetailsByOwnerId()`

**`occurrence.adapter.ts`:**
- `getOccurrenceById()` - campos: `startDate`, `limitDate`, `targetDate`, `createdAt`, `updatedAt`
- `getOccurrencesByTaskId()`
- `getOccurrencesByTaskIdAndStatus()`

**`task.adapter.ts`:**
- `getTaskById()` - campos: `completedAt`, `createdAt`, `updatedAt`
- `getTasksByOwnerId()`
- `getActiveTasksByOwnerId()`

**`recurrence.adapter.ts`:**
- `getRecurrenceById()` - campos: `creationDate`, `lastPeriodStart`, `endDate`

## Estado
- [x] Investigación inicial
- [x] Identificación de causa raíz
- [x] Implementación de solución v1 (fallida)
- [x] Implementación de solución v2 (pattern matching)
- [ ] Testing en producción
- [ ] Fix verificado
- [ ] Eliminar este archivo una vez verificado

## Testing en Producción
Después de desplegar, verificar:
1. Crear un evento para las 14:00 hora local
2. Verificar que se muestre 14:00 (no 11:00 ni 17:00)
3. Probar con eventos en diferentes horas del día
4. Verificar occurrences y tasks también

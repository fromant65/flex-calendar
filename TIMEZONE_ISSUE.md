# TODO DELETE -> Terminar de verificar y eliminar archivo una vez fix esté verificado en producción.
# Problema de Timezone en Producción

## Descripción
En producción, los eventos en el calendario no ajustan el horario por timezone del usuario, sino que muestran directamente el horario de UTC-0. El shift es exactamente de 3 horas hacia atrás (usuario en UTC-3).

## Causa Raíz Identificada

### El Problema
En producción (Vercel + Neon), Drizzle ORM a veces retorna fechas como **strings** en lugar de objetos **Date**. SuperJSON (usado como transformer en tRPC) solo transforma objetos Date correctamente. Cuando recibe strings, los envía tal cual al cliente, donde JavaScript los interpreta incorrectamente.

### Flujo del Problema
1. PostgreSQL (Neon) almacena: `2025-11-14 16:30:00+00` (UTC)
2. Drizzle en producción retorna: `"2025-11-14T16:30:00.000Z"` (string)
3. SuperJSON NO transforma (porque es string, no Date)
4. Cliente recibe: `"2025-11-14T16:30:00.000Z"` como string
5. Frontend hace `new Date("2025-11-14T16:30:00.000Z")`
6. Resultado: 13:30 en UTC-3 (3 horas menos)

### ¿Por qué funciona en desarrollo?
En desarrollo local, Drizzle puede retornar objetos Date directamente, que SuperJSON serializa/deserializa correctamente.

## Solución Implementada

### 1. Creación de Utilidades de Normalización
Archivo: `src/server/api/helpers/date-utils.ts`
- `ensureDate()`: Convierte cualquier valor a Date object
- `normalizeDates()`: Normaliza campos de fecha en un objeto
- `normalizeDatesArray()`: Normaliza fechas en un array

### 2. Aplicación en Adapters
Actualizado `calendar-event.adapter.ts` para normalizar todas las fechas antes de enviarlas al cliente:
- `getEventById()`
- `getEventsByOwnerId()`
- `getEventsByDateRange()`
- `getEventsWithDetailsByOwnerId()`

### Testing en Producción
Después de desplegar, verificar:
1. Crear un evento para las 14:00 hora local
2. Verificar que se muestre 14:00 (no 11:00 ni 17:00)
3. Probar con eventos en diferentes horas del día

## Estado
- [x] Investigación inicial
- [x] Identificación de causa raíz
- [x] Implementación de solución
- [ ] Testing en producción
- [ ] Fix verificado
- [ ] Aplicar solución a otros adapters si es necesario

## Próximos Pasos
Si la solución funciona, aplicar el mismo patrón a:
- `occurrence.adapter.ts`
- `task.adapter.ts`
- Cualquier otro adapter que retorne fechas

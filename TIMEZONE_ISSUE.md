# TODO DELETE -> Terminar de verificar y eliminar archivo una vez fix esté verificado en producción.
# Problema de Timezone en Producción

## Descripción
En producción, los eventos en el calendario se ven 3 horas antes del horario correcto (usuario en UTC-3).

## Nuevo Hallazgo - El problema está en la ESCRITURA, no en la LECTURA

### Comportamiento Observado:
**Desarrollo (funciona correctamente):**
- Usuario crea evento a las 14:00 (UTC-3)
- Se guarda en DB: `2025-11-14 17:00:00+00` (14:00 + 3 horas = 17:00 UTC) ✅
- Al leer, se convierte de vuelta a 14:00 local ✅

**Producción (falla):**
- Usuario crea evento a las 14:00 (UTC-3)
- Se guarda en DB: `2025-11-14 14:00:00+00` (¡INCORRECTO! debería ser 17:00 UTC) ❌
- Al leer, muestra 11:00 local (14:00 UTC - 3 horas) ❌

### Hipótesis:
El problema no es cómo leemos las fechas de la DB, sino **cómo las enviamos desde el cliente al servidor**.
En producción, cuando SuperJSON serializa los Date objects del cliente para enviarlos por tRPC, puede estar perdiendo la información de timezone local.

## Cambios Implementados

### 1. Creación de Fechas más Robusta (Cliente)
**Archivo:** `src/components/events/schedule-dialog.tsx`

Cambio en `handleSchedule()`:
- **Antes:** Usaba `new Date(selectedDate)` + `setHours()` (puede perder timezone)
- **Ahora:** Usa constructor completo de Date con año/mes/día/hora explícitos

### 2. Validación y Logs en Toda la Cadena

**Cliente** (`src/app/events/page.tsx` - handleSchedule):
- Logs antes de enviar fechas al servidor
- Muestra: Date object, ISO string, local string, timezone, offset

**Router** (`src/server/api/routers/calendar-event.router.ts`):
- Logs al recibir fechas del cliente (después de SuperJSON deserialización)
- Schema modificado para aceptar Date o string ISO
- Muestra: Date recibido, ISO, local, timezone del servidor

**Adapter** (`src/server/api/adapter/calendar-event.adapter.ts`):
- Logs antes de pasar fechas a Drizzle
- Normalización: convierte a Date si viene como string
- Muestra: Date final, ISO string
- Aplica a `createEvent()` y `updateEvent()`

### 3. Normalización de Fechas de Lectura (ya implementado)
**Archivos:** Adapters de `calendar-event`, `occurrence`, `task`, `recurrence`

Pattern matching para normalizar strings de la DB:
- Formato Postgres: `"2025-10-29 11:51:19.264+00"` → `"2025-10-29T11:51:19.264+00"`
- Preserva timezone original (+00, +00:00, Z, etc.)
- Agrega `Z` si no hay timezone

## Próximos Pasos - Testing en Producción

1. **Desplegar con logs de debug**
2. **Crear un evento** para las 14:00 hora local
3. **Revisar logs del servidor** (Vercel):
   - ¿Qué timezone tiene el servidor?
   - ¿Qué Date object recibe?
   - ¿El ISO string es correcto?
4. **Revisar logs del cliente** (browser console):
   - ¿Qué Date object se envía?
   - ¿El ISO string es correcto antes de enviar?
5. **Verificar en la DB** qué horario se guardó efectivamente

## Estado
- [x] Investigación inicial
- [x] Identificación de problema en lectura (resuelto con pattern matching)
- [x] Identificación de problema en escritura (hipótesis actual)
- [x] Implementación de creación de fechas más robusta
- [x] Agregado de logs de debug
- [ ] Testing en producción con logs
- [ ] Identificación de causa exacta en escritura
- [ ] Fix final verificado
- [ ] Eliminar este archivo y logs de debug

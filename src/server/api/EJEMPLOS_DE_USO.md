# Ejemplos de Uso de la API de Flex Calendar

Este archivo muestra cómo utilizar los diferentes endpoints de la API desde el cliente usando tRPC.

## EJEMPLOS DE TAREAS

### 1. Crear una tarea simple (única, no recurrente)

```typescript
const tarea = await api.task.create.mutate({
  name: "Comprar ingredientes para la cena",
  description: "Ir al supermercado y comprar: pollo, verduras, arroz",
  importance: 6,
});

console.log("Tarea creada:", tarea);
// Se crea automáticamente una ocurrencia única para esta tarea
```

### 2. Crear un hábito con recurrencia semanal

```typescript
const habito = await api.task.create.mutate({
  name: "Hacer ejercicio",
  description: "30 minutos de cardio y pesas",
  importance: 9,
  recurrence: {
    daysOfWeek: ["Mon", "Wed", "Fri"], // Lunes, Miércoles, Viernes
  },
});

console.log("Hábito creado:", habito);
// Se crea automáticamente la primera ocurrencia
```

### 3. Crear un hábito con recurrencia mensual

```typescript
const habito = await api.task.create.mutate({
  name: "Revisión mensual de finanzas",
  importance: 8,
  recurrence: {
    daysOfMonth: [1, 15], // Día 1 y 15 de cada mes
    maxOccurrences: 24, // Durante un año (12 meses × 2 ocurrencias)
  },
});

console.log("Hábito mensual creado:", habito);
```

### 4. Crear un hábito con intervalo

```typescript
const habito = await api.task.create.mutate({
  name: "Regar las plantas",
  importance: 5,
  recurrence: {
    interval: 3, // Cada 3 días
    endDate: new Date("2026-12-31"), // Fecha de fin
  },
});

console.log("Hábito con intervalo creado:", habito);
```

// 5. Obtener todas mis tareas activas
const obtenerTareasActivas = async () => {
  const tareas = await api.task.getMyActiveTasks.query();
  console.log("Tareas activas:", tareas);
};

// 6. Obtener detalles completos de una tarea
const obtenerDetallesTarea = async (taskId: number) => {
  const detalles = await api.task.getWithDetails.query({ id: taskId });
  console.log("Tarea con detalles:", detalles);
  // Incluye: recurrencia y próxima ocurrencia
};

// 7. Actualizar una tarea
const actualizarTarea = async (taskId: number) => {
  const actualizada = await api.task.update.mutate({
    id: taskId,
    data: {
      name: "Nuevo nombre de tarea",
      importance: 10,
    },
  });
  
  console.log("Tarea actualizada:", actualizada);
};

// 8. Desactivar una tarea
const desactivarTarea = async (taskId: number) => {
  const eliminada = await api.task.delete.mutate({ id: taskId });
  console.log("Tarea desactivada:", eliminada);
  // Soft delete: la tarea se mantiene en la DB pero isActive = false
};

// ==================== EJEMPLOS DE OCURRENCIAS ====================

// 9. Obtener ocurrencias de una tarea
const obtenerOcurrenciasTarea = async (taskId: number) => {
  const ocurrencias = await api.occurrence.getByTaskId.query({ taskId });
  console.log("Ocurrencias de la tarea:", ocurrencias);
};

// 10. Crear una ocurrencia manualmente
const crearOcurrenciaManual = async (taskId: number) => {
  const ocurrencia = await api.occurrence.create.mutate({
    associatedTaskId: taskId,
    startDate: new Date("2025-10-20"),
    targetDate: new Date("2025-10-25"),
    limitDate: new Date("2025-10-27"),
    targetTimeConsumption: 2.5, // 2.5 horas estimadas
  });
  
  console.log("Ocurrencia creada:", ocurrencia);
};

// 11. Actualizar una ocurrencia
const actualizarOcurrencia = async (occurrenceId: number) => {
  const actualizada = await api.occurrence.update.mutate({
    id: occurrenceId,
    data: {
      status: "In Progress",
      timeConsumed: 1.0, // 1 hora dedicada hasta ahora
    },
  });
  
  console.log("Ocurrencia actualizada:", actualizada);
  // La urgencia se recalcula automáticamente si cambian las fechas
};

// 12. Completar una ocurrencia
const completarOcurrencia = async (occurrenceId: number) => {
  await api.occurrence.complete.mutate({ id: occurrenceId });
  console.log("Ocurrencia completada");
  // Si la tarea es recurrente, se crea automáticamente la siguiente ocurrencia
};

// 13. Saltar una ocurrencia
const saltarOcurrencia = async (occurrenceId: number) => {
  await api.occurrence.skip.mutate({ id: occurrenceId });
  console.log("Ocurrencia saltada");
  // Si la tarea es recurrente, se crea automáticamente la siguiente ocurrencia
};

// 14. Obtener ocurrencias en un rango de fechas
const obtenerOcurrenciasPorFecha = async () => {
  const inicio = new Date("2025-10-01");
  const fin = new Date("2025-10-31");
  
  const ocurrencias = await api.occurrence.getByDateRange.query({
    startDate: inicio,
    endDate: fin,
  });
  
  console.log("Ocurrencias en octubre 2025:", ocurrencias);
};

// ==================== EJEMPLOS DE EVENTOS DE CALENDARIO ====================

// 15. Crear un evento fijo (bloqueado en el calendario)
const crearEventoFijo = async (occurrenceId: number) => {
  const evento = await api.calendarEvent.create.mutate({
    context: "Reunión importante - No mover",
    associatedOccurrenceId: occurrenceId,
    isFixed: true,
    start: new Date("2025-10-15T10:00:00"),
    finish: new Date("2025-10-15T11:30:00"),
  });
  
  console.log("Evento fijo creado:", evento);
};

// 16. Crear un evento móvil (puede reubicarse)
const crearEventoMovil = async (occurrenceId: number) => {
  const evento = await api.calendarEvent.create.mutate({
    context: "Sesión de estudio - Flexible",
    associatedOccurrenceId: occurrenceId,
    isFixed: false,
    start: new Date("2025-10-16T14:00:00"),
    finish: new Date("2025-10-16T16:00:00"),
  });
  
  console.log("Evento móvil creado:", evento);
};

// 17. Crear un evento sin tarea asociada
const crearEventoIndependiente = async () => {
  const evento = await api.calendarEvent.create.mutate({
    context: "Cita médica",
    isFixed: true,
    start: new Date("2025-10-18T09:00:00"),
    finish: new Date("2025-10-18T10:00:00"),
  });
  
  console.log("Evento independiente creado:", evento);
};

// 18. Obtener eventos de un mes
const obtenerEventosMes = async () => {
  const inicio = new Date("2025-10-01T00:00:00");
  const fin = new Date("2025-10-31T23:59:59");
  
  const eventos = await api.calendarEvent.getByDateRange.query({
    startDate: inicio,
    endDate: fin,
  });
  
  console.log("Eventos de octubre:", eventos);
};

// 19. Obtener mis eventos con detalles completos
const obtenerEventosConDetalles = async () => {
  const eventos = await api.calendarEvent.getMyEventsWithDetails.query();
  console.log("Eventos con detalles:", eventos);
  // Incluye: ocurrencia y tarea asociadas
};

// 20. Completar un evento
const completarEvento = async (eventId: number) => {
  const completado = await api.calendarEvent.complete.mutate({ id: eventId });
  console.log("Evento completado:", completado);
  // Calcula automáticamente el tiempo dedicado (finish - start)
  // Actualiza el tiempo consumido de la ocurrencia asociada
};

// 21. Actualizar un evento
const actualizarEvento = async (eventId: number) => {
  const actualizado = await api.calendarEvent.update.mutate({
    id: eventId,
    data: {
      start: new Date("2025-10-16T15:00:00"),
      finish: new Date("2025-10-16T17:00:00"),
      context: "Horario actualizado",
    },
  });
  
  console.log("Evento actualizado:", actualizado);
};

// ==================== EJEMPLOS DE ANÁLISIS Y ESTADÍSTICAS ====================

// 22. Obtener estadísticas del usuario
const obtenerEstadisticas = async () => {
  const stats = await api.task.getMyStatistics.query();
  console.log("Estadísticas:", stats);
  // Incluye: total de tareas, tareas activas, ocurrencias completadas/pendientes,
  // tiempo total dedicado, tasa de completitud
};

// 23. Obtener tareas ordenadas por urgencia
const obtenerTareasPorUrgencia = async () => {
  const urgentes = await api.task.getByUrgency.query();
  console.log("Tareas más urgentes:", urgentes);
  // Devuelve ocurrencias activas ordenadas por urgencia (de mayor a menor)
};

// ==================== FLUJO COMPLETO: CREAR Y GESTIONAR UNA TAREA ====================

const flujoCompleto = async () => {
  // 1. Crear tarea con hábito
  const tarea = await api.task.create.mutate({
    name: "Meditar",
    importance: 8,
    recurrence: {
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  });
  
  console.log("✓ Tarea creada:", tarea.id);
  
  // 2. Obtener la primera ocurrencia creada automáticamente
  const ocurrencias = await api.occurrence.getByTaskId.query({
    taskId: tarea.id,
  });
  const primeraOcurrencia = ocurrencias[0];
  
  console.log("✓ Primera ocurrencia:", primeraOcurrencia?.id);
  
  // 3. Crear evento en el calendario para esta ocurrencia
  if (primeraOcurrencia) {
    const evento = await api.calendarEvent.create.mutate({
      context: "Meditación matutina",
      associatedOccurrenceId: primeraOcurrencia.id,
      isFixed: false,
      start: new Date("2025-10-14T07:00:00"),
      finish: new Date("2025-10-14T07:20:00"),
    });
    
    console.log("✓ Evento creado:", evento.id);
    
    // 4. Completar el evento (registra tiempo dedicado)
    await api.calendarEvent.complete.mutate({ id: evento.id });
    console.log("✓ Evento completado");
    
    // 5. Completar la ocurrencia (crea la siguiente automáticamente)
    await api.occurrence.complete.mutate({ id: primeraOcurrencia.id });
    console.log("✓ Ocurrencia completada - Siguiente creada automáticamente");
  }
  
  // 6. Verificar estadísticas actualizadas
  const stats = await api.task.getMyStatistics.query();
  console.log("✓ Estadísticas actualizadas:", stats);
};

export {
  crearTareaSimple,
  crearHabitoSemanal,
  crearHabitoMensual,
  crearHabitoIntervalo,
  obtenerTareasActivas,
  obtenerDetallesTarea,
  actualizarTarea,
  desactivarTarea,
  obtenerOcurrenciasTarea,
  crearOcurrenciaManual,
  actualizarOcurrencia,
  completarOcurrencia,
  saltarOcurrencia,
  obtenerOcurrenciasPorFecha,
  crearEventoFijo,
  crearEventoMovil,
  crearEventoIndependiente,
  obtenerEventosMes,
  obtenerEventosConDetalles,
  completarEvento,
  actualizarEvento,
  obtenerEstadisticas,
  obtenerTareasPorUrgencia,
  flujoCompleto,
};

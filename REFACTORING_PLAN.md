# Plan de Refactorización: Sistema de Tipos de Tareas

## 📋 Resumen del Problema Actual

### Estructura Actual
El sistema maneja **6 tipos de tareas** basados en reglas de recurrencia:

1. **Única**: Sin recurrencia o `maxOccurrences = 1`
2. **Recurrente Finita**: `maxOccurrences > 1` sin `interval`
3. **Hábito**: Con `interval`, sin días específicos
4. **Hábito +**: Con `interval` y días específicos (daysOfWeek/daysOfMonth)
5. **Fija Única**: `isFixed = true` con `maxOccurrences = 1`
6. **Fija Repetitiva**: `isFixed = true` con patrón recurrente

### Problemas Identificados

1. **Lógica dispersa y duplicada**: Cada servicio tiene su propia lógica condicional para manejar tipos de tareas
   - `OccurrenceCompletionService`: 4 ramas if/else para tipos de tareas (líneas 66-88, 124-143)
   - `EventCompletionService`: Lógica duplicada similar (líneas 98-138, 228-251)
   - `BacklogDetectionService`: Chequeos manuales de tipos (líneas 52-54, 130-132)
   
2. **Dependencia de string literals**: Comparaciones directas como `taskType === "Hábito" || taskType === "Hábito +"`
   - Propensas a errores de tipeo
   - Difíciles de refactorizar
   - Sin type-safety

3. **Verificación inconsistente**: Algunos servicios usan `calculateTaskType()`, otros infieren el tipo mediante lógica inline
   - `occurrence-completion.service.ts` (líneas 66-88): Lógica inline basada en recurrence
   - `event-completion.service.ts` (línea 233): Usa `calculateTaskType()`

4. **Testing fragmentado**: Tests separados por carpetas de tipos pero sin abstracción común
   - 7 carpetas de tests: `single-task/`, `finite-recurring-task/`, `habit/`, `habit-plus/`, etc.
   - Cada una duplica setup y assertions similares

5. **Mantenibilidad**: Agregar un nuevo tipo de tarea requiere:
   - Modificar `calculateTaskType()` en helpers
   - Actualizar cada servicio con nueva rama condicional
   - Crear nueva carpeta de tests
   - Alto riesgo de olvidar algún lugar

## 🎯 Objetivos de la Refactorización

1. **Centralizar la lógica de tipos de tareas** en estrategias reutilizables
2. **Eliminar duplicación** de código entre servicios
3. **Facilitar extensibilidad** para agregar nuevos tipos de tareas
4. **Mejorar testabilidad** con abstracciones comunes
5. **Mantener compatibilidad** con la API existente

## 🏗️ Propuesta de Arquitectura: Strategy Pattern + Factory

### Estructura Propuesta

```
src/server/api/services/
├── task-strategies/              # NUEVO: Estrategias por tipo de tarea
│   ├── base/
│   │   ├── task-strategy.interface.ts      # Interfaz base
│   │   ├── abstract-task-strategy.ts       # Implementación común
│   │   └── strategy-types.ts               # Tipos compartidos
│   ├── implementations/
│   │   ├── single-task.strategy.ts         # Tarea Única
│   │   ├── finite-recurring.strategy.ts    # Recurrente Finita
│   │   ├── habit.strategy.ts               # Hábito
│   │   ├── habit-plus.strategy.ts          # Hábito +
│   │   ├── fixed-single.strategy.ts        # Fija Única
│   │   └── fixed-repetitive.strategy.ts    # Fija Repetitiva
│   ├── task-strategy.factory.ts            # Factory para crear estrategias
│   └── index.ts
├── core/
│   └── task-lifecycle.service.ts           # Mantiene rol de orquestador
├── occurrences/
│   ├── occurrence-completion.service.ts    # REFACTORIZADO: Usa estrategias
│   └── backlog-detection.service.ts        # REFACTORIZADO: Usa estrategias
├── events/
│   └── event-completion.service.ts         # REFACTORIZADO: Usa estrategias
└── scheduling/
    └── task-scheduler.service.ts           # REFACTORIZADO: Usa estrategias
```

### Interfaz Base: `ITaskStrategy`

```typescript
export interface ITaskStrategy {
  // Identificación
  readonly taskType: TaskType;
  
  // Lifecycle hooks
  onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction>;
  onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction>;
  onEventCompleted(context: EventContext): Promise<TaskLifecycleAction>;
  onEventSkipped(context: EventContext): Promise<TaskLifecycleAction>;
  
  // Occurrence generation
  shouldCreateNextOccurrence(context: TaskContext): boolean;
  shouldGenerateBacklogOccurrences(): boolean;
  
  // Task completion
  shouldCompleteTask(context: TaskCompletionContext): boolean;
  shouldDeactivateTask(context: TaskCompletionContext): boolean;
}

export type TaskLifecycleAction = 
  | { type: 'CREATE_NEXT_OCCURRENCE'; params?: any }
  | { type: 'COMPLETE_TASK' }
  | { type: 'DEACTIVATE_TASK' }
  | { type: 'NO_ACTION' };
```

### Factory Pattern

```typescript
export class TaskStrategyFactory {
  private strategies: Map<TaskType, ITaskStrategy>;
  
  constructor(dependencies: StrategyDependencies) {
    this.strategies = new Map([
      ['Única', new SingleTaskStrategy(dependencies)],
      ['Recurrente Finita', new FiniteRecurringStrategy(dependencies)],
      ['Hábito', new HabitStrategy(dependencies)],
      ['Hábito +', new HabitPlusStrategy(dependencies)],
      ['Fija Única', new FixedSingleStrategy(dependencies)],
      ['Fija Repetitiva', new FixedRepetitiveStrategy(dependencies)],
    ]);
  }
  
  getStrategy(task: Task, recurrence?: TaskRecurrence): ITaskStrategy {
    const taskType = calculateTaskType(recurrence, task);
    const strategy = this.strategies.get(taskType);
    
    if (!strategy) {
      throw new Error(`No strategy found for task type: ${taskType}`);
    }
    
    return strategy;
  }
}
```

### Ejemplo de Estrategia: HabitStrategy

```typescript
export class HabitStrategy extends AbstractTaskStrategy {
  readonly taskType: TaskType = 'Hábito';
  
  async onOccurrenceCompleted(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    // Lógica específica para hábitos
    await this.deps.scheduler.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );
    
    return {
      type: 'CREATE_NEXT_OCCURRENCE',
      params: { taskId: context.task.id }
    };
  }
  
  async onOccurrenceSkipped(context: OccurrenceContext): Promise<TaskLifecycleAction> {
    await this.deps.scheduler.incrementCompletedOccurrences(
      context.recurrence.id,
      context.occurrence.startDate
    );
    
    return {
      type: 'CREATE_NEXT_OCCURRENCE',
      params: { taskId: context.task.id }
    };
  }
  
  shouldCreateNextOccurrence(context: TaskContext): boolean {
    return context.lastOccurrence?.status === 'Completed' || 
           context.lastOccurrence?.status === 'Skipped';
  }
  
  shouldGenerateBacklogOccurrences(): boolean {
    return true; // Los hábitos generan ocurrencias en backlog
  }
  
  shouldCompleteTask(context: TaskCompletionContext): boolean {
    return false; // Los hábitos nunca se completan automáticamente
  }
}
```

## 📝 Plan de Implementación por Fases

### Fase 1: Crear Infraestructura Base (1-2 días)

**Objetivo**: Establecer la estructura sin romper código existente

1. **Crear estructura de directorios**
   ```
   src/server/api/services/task-strategies/
   ├── base/
   ├── implementations/
   └── index.ts
   ```

2. **Definir interfaces y tipos**
   - `ITaskStrategy` interface
   - `TaskLifecycleAction` type
   - Context types (`OccurrenceContext`, `EventContext`, etc.)
   - `StrategyDependencies` interface

3. **Implementar clase base abstracta**
   - `AbstractTaskStrategy` con lógica común
   - Métodos helper compartidos

4. **Crear Factory**
   - `TaskStrategyFactory` para instanciar estrategias
   - Integrar con `calculateTaskType()`

**Entregables**:
- ✅ Estructura de carpetas creada
- ✅ Interfaces y tipos definidos
- ✅ Factory implementado
- ✅ Tests unitarios del factory

### Fase 2: Implementar Estrategias (2-3 días)

**Objetivo**: Migrar lógica existente a estrategias

**Orden sugerido** (de simple a complejo):

1. **SingleTaskStrategy** (más simple)
   - Extraer lógica de `occurrence-completion.service.ts` líneas 66-69
   - Test: `single-task/` tests existentes

2. **FiniteRecurringStrategy**
   - Extraer lógica de `occurrence-completion.service.ts` líneas 72-83
   - Test: `finite-recurring-task/` tests existentes

3. **HabitStrategy**
   - Extraer lógica de `occurrence-completion.service.ts` líneas 85-88
   - Test: `habit/` tests existentes

4. **HabitPlusStrategy** (más complejo: períodos)
   - Extraer lógica similar a Habit pero con período
   - Integrar con `PeriodManager`
   - Test: `habit-plus/` tests existentes

5. **FixedSingleStrategy**
   - Extraer lógica de `event-completion.service.ts` líneas 131-134
   - Test: `single-fixed-task/` tests existentes

6. **FixedRepetitiveStrategy**
   - Extraer lógica de `event-completion.service.ts` líneas 135-139
   - Integrar con `FixedTaskService`
   - Test: `repetitive-fixed-task/` tests existentes

**Para cada estrategia**:
1. Implementar interfaz `ITaskStrategy`
2. Migrar lógica de servicios existentes
3. Crear tests unitarios de la estrategia en aislamiento
4. Verificar que tests existentes sigan pasando

**Entregables**:
- ✅ 6 estrategias implementadas
- ✅ Tests unitarios para cada estrategia
- ✅ Documentación inline

### Fase 3: Refactorizar Servicios (2-3 días)

**Objetivo**: Integrar estrategias en servicios existentes

**Servicios a refactorizar** (orden sugerido):

1. **OccurrenceCompletionService**
   ```typescript
   // ANTES (líneas 38-88):
   if (recurrence.maxOccurrences === 1 && !recurrence.interval) {
     await this.taskAdapter.completeTask(task.id);
   } else if (task.isFixed) {
     await this.checkAndCompleteIfAllDone(task.id);
   } else if (recurrence.maxOccurrences && recurrence.maxOccurrences > 1 && !recurrence.interval) {
     // ...lógica compleja
   } else if (recurrence.interval) {
     await this.schedulerService.createNextOccurrence(task.id);
   }
   
   // DESPUÉS:
   const strategy = this.strategyFactory.getStrategy(task, recurrence);
   const action = await strategy.onOccurrenceCompleted({
     occurrence,
     task,
     recurrence
   });
   await this.executeAction(action);
   ```

2. **EventCompletionService**
   - Similar a OccurrenceCompletionService
   - Líneas 98-138 y 228-251

3. **BacklogDetectionService**
   ```typescript
   // ANTES (líneas 52-54):
   const taskType = calculateTaskType(task.recurrence, task);
   const shouldGenerateOccurrences = taskType === "Hábito" || taskType === "Hábito +";
   
   // DESPUÉS:
   const strategy = this.strategyFactory.getStrategy(task, task.recurrence);
   const shouldGenerateOccurrences = strategy.shouldGenerateBacklogOccurrences();
   ```

4. **TaskSchedulerService** (menor impacto)
   - Integrar estrategias en `shouldCreateNextOccurrence()`

**Para cada servicio**:
1. Inyectar `TaskStrategyFactory` en constructor
2. Reemplazar lógica condicional con llamadas a estrategias
3. Implementar `executeAction()` helper
4. Ejecutar tests existentes (deben pasar sin cambios)
5. Agregar tests de integración

**Entregables**:
- ✅ Servicios refactorizados
- ✅ Tests de integración pasando
- ✅ Tests existentes pasando (sin modificaciones)

### Fase 4: Testing y Validación (1-2 días)

**Objetivo**: Asegurar cobertura completa y comportamiento correcto

1. **Tests de estrategias en aislamiento**
   - Unit tests para cada estrategia
   - Mock dependencies
   - Cobertura > 90%

2. **Tests de integración**
   - Servicios usando estrategias reales
   - Flujos end-to-end por tipo de tarea
   - Usar tests existentes como baseline

3. **Tests de regresión**
   - Ejecutar toda la suite de tests existente
   - Verificar que NO hay cambios de comportamiento
   - `jest --coverage`

4. **Tests de casos edge**
   - Transiciones de período (Hábito+)
   - Backlog con múltiples ocurrencias
   - Tasks con recurrence null/undefined

**Entregables**:
- ✅ Suite de tests completa pasando
- ✅ Cobertura > 90% en task-strategies/
- ✅ Reporte de regresión (sin cambios)

### Fase 5: Documentación y Limpieza (1 día)

**Objetivo**: Dejar el código listo para extensión futura

1. **Documentación**
   - README en `task-strategies/` explicando el patrón
   - Guía de cómo agregar un nuevo tipo de tarea
   - Diagramas de flujo (opcional)

2. **Cleanup**
   - Eliminar código comentado
   - Remover TODOs obsoletos
   - Consolidar imports

3. **Refactorización de tests** (opcional)
   - Crear helpers comunes en `__tests__/helpers/`
   - Base test class para estrategias
   - Reducir duplicación en test setup

**Entregables**:
- ✅ README.md en task-strategies/
- ✅ CONTRIBUTING.md con guía de extensión
- ✅ Código limpio y documentado

## 🔄 Cómo Agregar un Nuevo Tipo de Tarea (Post-Refactorización)

### Antes de la refactorización (estado actual):
1. ❌ Modificar `calculateTaskType()` en helpers
2. ❌ Actualizar type `TaskType` 
3. ❌ Modificar `OccurrenceCompletionService.completeOccurrence()` (+10 líneas)
4. ❌ Modificar `OccurrenceCompletionService.skipOccurrence()` (+10 líneas)
5. ❌ Modificar `EventCompletionService.completeCalendarEvent()` (+15 líneas)
6. ❌ Modificar `EventCompletionService.skipCalendarEvent()` (+15 líneas)
7. ❌ Modificar `BacklogDetectionService.detectBacklog()` (+5 líneas)
8. ❌ Crear carpeta de tests con 2-3 archivos
9. ❌ **Riesgo**: Olvidar algún servicio y tener bugs sutiles

### Después de la refactorización (propuesto):
1. ✅ Crear `new-task-type.strategy.ts` (~100 líneas)
2. ✅ Registrar en `TaskStrategyFactory`
3. ✅ Actualizar type `TaskType`
4. ✅ Modificar `calculateTaskType()` si usa nueva lógica de detección
5. ✅ Crear `new-task-type.strategy.test.ts`
6. ✅ **Beneficio**: Todas las integraciones funcionan automáticamente

**Reducción**: De ~50-60 líneas dispersas en 6+ archivos a ~120 líneas en 2 archivos localizados.

## 📊 Comparación: Antes vs Después

### Complejidad del Código

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Líneas de lógica condicional** | ~200 líneas dispersas | ~50 líneas (factory + dispatcher) |
| **Archivos tocados por cambio** | 6-8 archivos | 2-3 archivos |
| **Duplicación de lógica** | Alta (3-4 lugares) | Baja (centralizada) |
| **Tests por tipo de tarea** | 15-20 tests dispersos | 10-15 tests + 5 estrategia tests |

### Mantenibilidad

| Tarea | Antes | Después |
|-------|-------|---------|
| Agregar tipo de tarea | 2-3 horas | 1-1.5 horas |
| Modificar comportamiento tipo | 1-2 horas (buscar/reemplazar) | 30 min (modificar estrategia) |
| Depurar bug en tipo específico | Difícil (lógica dispersa) | Fácil (estrategia aislada) |
| Testing de tipo específico | Complejo (setup pesado) | Simple (mock dependencies) |

## ⚠️ Riesgos y Mitigaciones

### Riesgos Identificados

1. **Riesgo**: Romper funcionalidad existente durante refactorización
   - **Mitigación**: Implementación incremental con tests de regresión en cada fase
   - **Mitigación**: Feature flags para rollback rápido

2. **Riesgo**: Over-engineering (agregar complejidad innecesaria)
   - **Mitigación**: Mantener estrategias simples y enfocadas
   - **Mitigación**: Solo abstraer lo que realmente varía entre tipos

3. **Riesgo**: Performance overhead por indirección
   - **Mitigación**: Factory cachea estrategias (creación única)
   - **Mitigación**: Strategy pattern es overhead mínimo (~1-2% en benchmarks)

4. **Riesgo**: Dificultad para nuevos desarrolladores
   - **Mitigación**: Documentación exhaustiva con ejemplos
   - **Mitigación**: Diagramas de arquitectura

### Plan de Rollback

Si la refactorización introduce bugs críticos:
1. **Fase 1-2**: Solo código nuevo, fácil de revertir (eliminar carpeta)
2. **Fase 3**: Usar feature flag `USE_TASK_STRATEGIES` (default: false)
3. **Fase 4**: Mantener código antiguo como `*.legacy.ts` hasta estabilización
4. **Fase 5**: Eliminar código legacy después de 1-2 sprints estables

## 🎓 Beneficios a Largo Plazo

### Extensibilidad
- ✅ Agregar nuevos tipos de tarea es trivial
- ✅ Modificar comportamiento de un tipo no afecta otros
- ✅ Fácil experimentar con variantes (A/B testing)

### Testabilidad
- ✅ Tests unitarios de estrategias en aislamiento
- ✅ Mock dependencies sin complicaciones
- ✅ Coverage más alto con menos tests

### Mantenibilidad
- ✅ Código más legible (intención clara)
- ✅ Cambios localizados (no "shotgun surgery")
- ✅ Menos bugs por cambios olvidados

### Escalabilidad
- ✅ Preparado para agregar complejidad futura
- ✅ Base sólida para nuevas features
- ✅ Patrones claros para el equipo

## 🚀 Próximos Pasos

### Inmediatos (Esta Semana)
1. ✅ Revisar y aprobar este plan
2. ⏳ Crear branch `refactor/task-strategies`
3. ⏳ Iniciar Fase 1: Infraestructura base

### Corto Plazo (Próximas 2 Semanas)
1. ⏳ Completar Fases 1-3
2. ⏳ Code review incremental después de cada fase
3. ⏳ Merge a main después de Fase 3 con feature flag

### Mediano Plazo (Próximo Mes)
1. ⏳ Completar Fases 4-5
2. ⏳ Habilitar feature flag en producción
3. ⏳ Eliminar código legacy
4. ⏳ Documentar patrones para el equipo

---

## 📚 Referencias

- **Design Patterns**: Strategy Pattern (Gang of Four)
- **Refactoring**: Martin Fowler - "Replace Conditional with Polymorphism"
- **Clean Architecture**: Robert C. Martin - "Dependency Inversion Principle"

## 🤝 Contribución

Este plan es un documento vivo. Sugerencias y mejoras son bienvenidas:
1. Abrir issue con etiqueta `refactoring`
2. Proponer cambios en code review
3. Actualizar este documento según evolucione el plan

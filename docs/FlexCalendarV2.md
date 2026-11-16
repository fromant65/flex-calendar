# FlexCalendar-v2
*Versión: 2.0 | Revisada para compatibilidad con implementación actual (2026-04-13)*

## Descripción inicial
App flexible para llevar una agenda personal. Expandible a tareas en equipo.
Una agenda es una lista de tareas organizadas en bloques de tiempo a lo largo de un día, semana, mes, etc.
Una tarea tiene varias características:
### Características de una tarea
- Duración: cantidad de tiempo estimado que puede tardar completarla
- Dificultad: nivel esperado de esfuerzo que requiere para llevarse a cabo por unidad de tiempo
- Fecha de creación: cuándo se creó la tarea
- Fecha tentativa: cuándo espera finalizarse (fecha y hora)
- Fecha límite: antes de qué fecha y hora debe finalizarse
- Umbral de urgencia: cuánto tiempo debe faltar antes de la fecha límite para que la tarea se considere urgente (no se toma la fecha tentativa como umbral ya que puede ser muy cercana a la límite)
- Importancia: qué tan relevante es terminar esta tarea
- Divisibilidad: si se debe hacer en una sesión contigua o se puede dividir en varias sesiones
#### Cálculo de urgencia
La urgencia se calcula según la fecha límite y el umbral de urgencia. Una tarea se considera urgente si tiene un puntaje de urgencia mayor a 5. El cálculo de puntaje de 0 a 5 es lineal entre la fecha de creación y el umbral, y también es lineal entre el umbral y la fecha límite. Idealmente el umbral de urgencia debe colocarse antes de la fecha tentativa.

### Ocurrencias
Si las tareas son divisibles, entonces se deben crear varias ocurrencias de cada tarea (1 ocurrencia para las que no son divisibles, varias para las que sí). Generalmente no sabemos cuántas ocurrencias tendrá una tarea de antemano, así que se deben poder crear dinámicamente. 

**Ciclo de vida de una ocurrencia**:

1. **Estado: No Asignada (Unassigned)**
   - Tiempo de inicio: NULL
   - Tiempo de finalización: NULL
   - Descripción: Ocurrencia creada pero sin bloque de tiempo reservado en el calendario
   - Acción: Mostrar en lista de tareas disponibles para asignar

2. **Estado: Asignada (Assigned)**
   - Tiempo de inicio: NOT NULL
   - Tiempo de finalización: NOT NULL
   - Descripción: Ocurrencia reservada en un bloque específico del calendario
   - Acción: Mostrar en matriz de Eisenhower y calendario

3. **Estado: Completada (Completed)**
   - Tiempo de inicio: NOT NULL
   - Tiempo de finalización: NOT NULL
   - Completada en: timestamp
   - Descripción: Ocurrencia asignada y finalizada
   - Acción: Marcar como completa, registrar tiempo consumido

4. **Estado: Saltada (Skipped)**
   - Descripción: Ocurrencia descartada sin completar
   - Acción: Marcar como saltada, puede generar nueva ocurrencia

**Restricción clave**: Una ocurrencia SOLO puede completarse si fue previamente asignada (tiene slot de tiempo NOT NULL).
### Rutinas
Una tarea es la unidad minima de organización de la aplicación, pero varias tareas pueden estar relacionadas entre sí de distintas formas:
- Orden: ciertas tareas deben realizarse antes que otras
- Dependencia: ciertas tareas dependen de que otras se realicen antes de poder ser empezadas
- **Recurrencia: Aplicada a toda la rutina (no a tareas individuales)**

**Campos de recurrencia de una rutina**:
- recurrence_type: none / finite / infinite
- interval: cantidad de unidades entre repeticiones
- days_of_week: días concretos de la semana cuando aplique
- days_of_month: días concretos del mes cuando aplique
- max_occurrences: límite total de ocurrencias cuando la recurrencia es finita
- last_period_start: inicio del último período permitido o planificado
- end_date: fecha de fin para cortar la generación

**Modelo de recurrencia actualizado**:
- Una tarea **individual** (sin rutina) NO tiene recurrencia; es una tarea única o divisible en sesiones, pero no se repite
- Una tarea **dentro de una rutina** hereda la regla de recurrencia de su contenedor
- La recurrencia de una rutina define cómo se generan nuevas ocurrencias de TODAS las tareas en esa rutina

Ejemplo:
- Rutina: "Sesión de Estudio Diaria",  recurrencia: DAILY
  - Tarea 1: "Leer capítulo" → Heredará recurrencia DAILY (generar nueva ocurrencia cada día)
  - Tarea 2: "Hacer ejercicios" → Heredará recurrencia DAILY
- Rutina: "Reunión de Proyecto", recurrencia: WEEKLY (cada martes)
  - Tarea 1: "Preparar agenda" → Heredará recurrencia WEEKLY
  - Tarea 3: "Presentar avances" → Heredará recurrencia WEEKLY

Para evitar dependencias circulares, la topología de toda rutina será esencialmente un árbol (DAG - Directed Acyclic Graph).

Se debe poder crear rutinas a partir de las tareas existentes, y se deben poder crear tareas dentro de una rutina.

**Restricción**: Ninguna rutina puede tener ciclos (A → B → C → A no es permitido).

### Tipología de Tareas (Combinación de Atributos)

En lugar de tipos discretos, una tarea en v2 se define por la combinación de atributos:

| Atributo | Valores | Ejemplos |
|----------|---------|----------|
| **is_divisible** | true / false | Hábito (divisible), Reunión fija (no divisible) |
| **recurrence_type** | none / finite / infinite | Tarea única (none), Hábito temporal (finite), Hábito continuo (infinite) |
| **is_fixed** | true / false | Reunión a las 10:00 (fixed), Estudio flexible (no fixed) |

Mapeo de tipos anterior a v2:
- Tarea Única → (divisible=false, recurrence=none, fixed=false)
- Tarea Fija Única → (divisible=false, recurrence=none, fixed=true)
- Recurrencia Finita → (divisible=true, recurrence=finite, fixed=false)
- Hábito → (divisible=true, recurrence=infinite, fixed=false)
- Hábito+ → (divisible=true, recurrence=infinite, fixed=false, con límites por período)
- Fija Repetitiva → (divisible=false, recurrence=finite/infinite, fixed=true)

### Acomodando la agenda
El usuario necesita una interfaz sencilla e intuitiva para poder ver su agenda y administrarla. Lo que se acomoda en la agenda son las OCURRENCIAS.
#### PC
En la versión de PC podemos establecer 3 columnas:
- Lista de tareas, que nos permita agregar ocurrencias a la matriz. Se deberá indicar además si una tarea está asociada a una rutina
- Matriz de Eisenhower, que nos muestre las ocurrencias por cuadrantes según urgencia e importancia. La dificultad se muestra con colores
- Calendario: muestra la disposición de ocurrencias por bloques
#### Mobile
En la versión de mobile deberemos recurrir a usar 3 pestañas con swipe lateral. La disposición es la misma que en PC, pero solo se muestra una pestaña a la vez
### Completando tareas y rutinas
Un atajo util que puede tener la aplicación es el de marcar tareas o rutinas como completadas sin la necesidad de agregarlas al calendario
### Avanzando y completando tareas a través de ocurrencias
El completar ocurrencias no implica necesariamente completar las tareas divisibles, por lo que debemos agregar un diálogo que nos permita completar una tarea al completar una ocurrencia asociada a ella. Por otro lado, también es util un diálogo que nos permita actualizar el tiempo destinada a la misma al completar la ocurrencia
## Interfaz general
### Página principal: Agenda
Se mostrarán las 3 columnas/pestañas para acomodar la agenda. En caso de que no haya tareas activas, se mostrará un link a la página de creación de tareas
### Página de tareas
En esta página se permiten crear tareas individuales
### Página de rutinas
En esta página se permiten crear rutinas, asignarles tareas existentes y crear tareas dentro de una rutina, además de acomodar el orden y dependencia de las mismas

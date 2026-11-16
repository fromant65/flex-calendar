"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, GitBranch, ListTodo } from "lucide-react"
import { toast } from "sonner"
import { api } from "~/trpc/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import type { RoutineGetMyRoutinesOutput } from "~/server/api/routers/derived-endpoint-types"
import { LoadingPage } from "~/components/ui/loading-spinner"

type RoutineListItem = RoutineGetMyRoutinesOutput[number]

const recurrenceModeOptions = [
  {
    value: "none",
    label: "Sin recurrencia",
    description: "La rutina no se repite; se usa para una sola ejecución o plan puntual.",
  },
  {
    value: "finite",
    label: "Recurrencia finita",
    description: "La rutina se repite durante un periodo o cantidad limitada de repeticiones.",
  },
  {
    value: "infinite",
    label: "Recurrencia infinita",
    description: "La rutina se repite de forma continua sin una fecha de fin predeterminada.",
  },
] as const

const dayOfWeekOptions = [
  { value: "Mon", label: "Lun" },
  { value: "Tue", label: "Mar" },
  { value: "Wed", label: "Mié" },
  { value: "Thu", label: "Jue" },
  { value: "Fri", label: "Vie" },
  { value: "Sat", label: "Sáb" },
  { value: "Sun", label: "Dom" },
] as const

function getRecurrenceLabel(routine: RoutineListItem) {
  const recurrenceType = routine.recurrenceType ?? "none"

  if (recurrenceType === "none") {
    return "Sin recurrencia"
  }

  const typeLabel = recurrenceModeOptions.find((option) => option.value === recurrenceType)?.label ?? recurrenceType
  const intervalLabel = routine.recurrenceInterval ? `cada ${routine.recurrenceInterval} ${routine.recurrenceInterval === 1 ? "unidad" : "unidades"}` : "sin intervalo"
  const daysOfWeekLabel = routine.recurrenceDaysOfWeek?.length
    ? routine.recurrenceDaysOfWeek.join(", ")
    : null
  const daysOfMonthLabel = routine.recurrenceDaysOfMonth?.length
    ? routine.recurrenceDaysOfMonth.join(", ")
    : null

  const fragments = [typeLabel, intervalLabel]
  if (daysOfWeekLabel) fragments.push(`días: ${daysOfWeekLabel}`)
  if (daysOfMonthLabel) fragments.push(`días del mes: ${daysOfMonthLabel}`)
  if (routine.recurrenceMaxOccurrences) fragments.push(`máx. ${routine.recurrenceMaxOccurrences}`)
  if (routine.recurrenceEndDate) fragments.push(`hasta ${routine.recurrenceEndDate.toLocaleDateString()}`)

  return fragments.join(" · ")
}

export default function RoutinesPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [recurrenceType, setRecurrenceType] = useState<(typeof recurrenceModeOptions)[number]["value"]>("none")
  const [recurrenceInterval, setRecurrenceInterval] = useState("1")
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<Array<(typeof dayOfWeekOptions)[number]["value"]>>([])
  const [recurrenceDaysOfMonth, setRecurrenceDaysOfMonth] = useState("")
  const [recurrenceMaxOccurrences, setRecurrenceMaxOccurrences] = useState("")
  const [recurrenceLastPeriodStart, setRecurrenceLastPeriodStart] = useState("")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null)
  const [taskIdToAdd, setTaskIdToAdd] = useState("")
  const [dependencyFromTaskId, setDependencyFromTaskId] = useState("")
  const [dependencyToTaskId, setDependencyToTaskId] = useState("")
  const [dependencyType, setDependencyType] = useState<"ORDER" | "DEPENDENCY">("DEPENDENCY")

  const utils = api.useUtils()

  const { data: routines = [], isLoading, error } = api.routine.getMyRoutines.useQuery()
  const { data: availableTasks = [] } = api.task.getMyTasks.useQuery()

  const selectedRoutine = useMemo(() => {
    return routines.find((routine) => routine.id === selectedRoutineId) ?? null
  }, [routines, selectedRoutineId])

  const {
    data: selectedRoutineDetails,
    isFetching: loadingDetails,
  } = api.routine.getById.useQuery(
    { routineId: selectedRoutineId ?? 0 },
    { enabled: selectedRoutineId !== null },
  )

  const createRoutineMutation = api.routine.create.useMutation({
    onSuccess: async (createdRoutine) => {
      toast.success("Rutina creada", {
        description: "La rutina v2 se creó correctamente",
      })
      setName("")
      setDescription("")
      setRecurrenceType("none")
      setRecurrenceInterval("1")
      setRecurrenceDaysOfWeek([])
      setRecurrenceDaysOfMonth("")
      setRecurrenceMaxOccurrences("")
      setRecurrenceLastPeriodStart("")
      setRecurrenceEndDate("")
      const createdRoutineId = createdRoutine?.id
      if (typeof createdRoutineId === "number") {
        setSelectedRoutineId(createdRoutineId)
      }
      await utils.routine.getMyRoutines.invalidate()
    },
    onError: (createError) => {
      toast.error("Error al crear rutina", {
        description: createError.message,
      })
    },
  })

  const updateRoutineMutation = api.routine.update.useMutation({
    onSuccess: async () => {
      await utils.routine.getMyRoutines.invalidate()
      if (selectedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: selectedRoutineId })
      }
    },
    onError: (updateError) => {
      toast.error("No se pudo actualizar la rutina", {
        description: updateError.message,
      })
    },
  })

  const deleteRoutineMutation = api.routine.delete.useMutation({
    onSuccess: async () => {
      toast.success("Rutina eliminada")
      const deletedRoutineId = selectedRoutineId
      setSelectedRoutineId(null)
      await utils.routine.getMyRoutines.invalidate()
      if (deletedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: deletedRoutineId })
      }
    },
    onError: (deleteError) => {
      toast.error("No se pudo eliminar la rutina", {
        description: deleteError.message,
      })
    },
  })

  const addTaskMutation = api.routine.addTask.useMutation({
    onSuccess: async () => {
      setTaskIdToAdd("")
      await utils.routine.getMyRoutines.invalidate()
      if (selectedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: selectedRoutineId })
      }
    },
    onError: (addTaskError) => {
      toast.error("No se pudo agregar la tarea", {
        description: addTaskError.message,
      })
    },
  })

  const removeTaskMutation = api.routine.removeTask.useMutation({
    onSuccess: async () => {
      await utils.routine.getMyRoutines.invalidate()
      if (selectedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: selectedRoutineId })
      }
    },
    onError: (removeTaskError) => {
      toast.error("No se pudo quitar la tarea", {
        description: removeTaskError.message,
      })
    },
  })

  const addDependencyMutation = api.routine.addDependency.useMutation({
    onSuccess: async () => {
      setDependencyFromTaskId("")
      setDependencyToTaskId("")
      setDependencyType("DEPENDENCY")
      if (selectedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: selectedRoutineId })
      }
    },
    onError: (addDependencyError) => {
      toast.error("No se pudo agregar la dependencia", {
        description: addDependencyError.message,
      })
    },
  })

  const removeDependencyMutation = api.routine.removeDependency.useMutation({
    onSuccess: async () => {
      if (selectedRoutineId !== null) {
        await utils.routine.getById.invalidate({ routineId: selectedRoutineId })
      }
    },
    onError: (removeDependencyError) => {
      toast.error("No se pudo quitar la dependencia", {
        description: removeDependencyError.message,
      })
    },
  })

  const validateDagQuery = api.routine.validateDag.useQuery(
    { routineId: selectedRoutineId ?? 0 },
    { enabled: false },
  )

  const handleCreateRoutine = () => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0) {
      toast.error("El nombre es obligatorio")
      return
    }

    const trimmedDescription = description.trim()
    const parsedInterval = Number(recurrenceInterval)
    const parsedDaysOfMonth = recurrenceDaysOfMonth
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 31)
    const parsedMaxOccurrences = Number(recurrenceMaxOccurrences)

    const recurrence =
      recurrenceType === "none"
        ? { recurrenceType: "none" as const }
        : {
            recurrenceType,
            interval: Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : undefined,
            daysOfWeek: recurrenceDaysOfWeek.length > 0 ? recurrenceDaysOfWeek : undefined,
            daysOfMonth: parsedDaysOfMonth.length > 0 ? parsedDaysOfMonth : undefined,
            maxOccurrences: Number.isFinite(parsedMaxOccurrences) && parsedMaxOccurrences > 0 ? parsedMaxOccurrences : undefined,
            lastPeriodStart: recurrenceLastPeriodStart ? new Date(recurrenceLastPeriodStart) : undefined,
            endDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
          }

    createRoutineMutation.mutate({
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : undefined,
      recurrence,
    })
  }

  const toggleDayOfWeek = (day: (typeof dayOfWeekOptions)[number]["value"]) => {
    setRecurrenceDaysOfWeek((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day],
    )
  }

  const handleToggleRoutine = (routine: RoutineListItem, isActive: boolean) => {
    updateRoutineMutation.mutate({
      routineId: routine.id,
      data: { isActive },
    })
  }

  const handleDeleteRoutine = (routineId: number) => {
    deleteRoutineMutation.mutate({ routineId })
  }

  const handleAddTaskToRoutine = () => {
    if (selectedRoutineId === null) return

    const parsedTaskId = Number(taskIdToAdd)
    if (!Number.isFinite(parsedTaskId) || parsedTaskId <= 0) {
      toast.error("Selecciona una tarea válida")
      return
    }

    addTaskMutation.mutate({ routineId: selectedRoutineId, taskId: parsedTaskId })
  }

  const handleRemoveTaskFromRoutine = (taskId: number) => {
    if (selectedRoutineId === null) return
    removeTaskMutation.mutate({ routineId: selectedRoutineId, taskId })
  }

  const handleAddDependency = () => {
    if (selectedRoutineId === null) return

    const fromTaskId = Number(dependencyFromTaskId)
    const toTaskId = Number(dependencyToTaskId)

    if (!Number.isFinite(fromTaskId) || !Number.isFinite(toTaskId) || fromTaskId <= 0 || toTaskId <= 0) {
      toast.error("Selecciona dos tareas válidas")
      return
    }

    if (fromTaskId === toTaskId) {
      toast.error("La dependencia no puede apuntar a la misma tarea")
      return
    }

    addDependencyMutation.mutate({
      routineId: selectedRoutineId,
      fromTaskId,
      toTaskId,
      edgeType: dependencyType,
    })
  }

  const handleRemoveDependency = (fromTaskId: number, toTaskId: number, edgeTypeValue: "ORDER" | "DEPENDENCY") => {
    if (selectedRoutineId === null) return

    removeDependencyMutation.mutate({
      routineId: selectedRoutineId,
      fromTaskId,
      toTaskId,
      edgeType: edgeTypeValue,
    })
  }

  const handleValidateSelectedRoutine = async () => {
    if (selectedRoutineId === null) return

    const result = await validateDagQuery.refetch()

    if (result.error) {
      toast.error("No se pudo validar la rutina", {
        description: result.error.message,
      })
      return
    }

    if (result.data?.isValid) {
      toast.success("DAG válido", {
        description: "La rutina no tiene ciclos",
      })
      return
    }

    toast.error("DAG inválido", {
      description: "Se detectó un ciclo en dependencias",
    })
  }

  if (isLoading) {
    return <LoadingPage text="Cargando rutinas..." />
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Rutinas v2</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión inicial de rutinas sobre el servicio backend v2 (CRUD, estado activo y validación DAG).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Nueva rutina</CardTitle>
            <CardDescription>
              Crea rutinas con regla de recurrencia de nivel rutina.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="routine-name">Nombre</Label>
              <Input
                id="routine-name"
                placeholder="Ej: Sesión de estudio diaria"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routine-description">Descripción</Label>
              <Textarea
                id="routine-description"
                placeholder="Descripción opcional"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="routine-recurrence">Recurrencia de la rutina</Label>
              <div className="grid gap-2">
                <select
                  id="routine-recurrence"
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={recurrenceType}
                  onChange={(event) => setRecurrenceType(event.target.value as (typeof recurrenceModeOptions)[number]["value"])}
                >
                  {recurrenceModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Puedes dejarla sin recurrencia o elegir si la rutina se repite de forma finita o infinita.
                </p>
              </div>

              <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {recurrenceModeOptions.map((option) => (
                  <div key={option.value} className="space-y-0.5">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p>{option.description}</p>
                  </div>
                ))}
              </div>

              {recurrenceType !== "none" && (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="routine-interval">Intervalo</Label>
                    <Input
                      id="routine-interval"
                      type="number"
                      min={1}
                      step={1}
                      value={recurrenceInterval}
                      onChange={(event) => setRecurrenceInterval(event.target.value)}
                      placeholder="Ej: 1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define cada cuántas unidades se repite la rutina.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Días de la semana</Label>
                    <div className="flex flex-wrap gap-2">
                      {dayOfWeekOptions.map((option) => {
                        const isSelected = recurrenceDaysOfWeek.includes(option.value)

                        return (
                          <Button
                            key={option.value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDayOfWeek(option.value)}
                          >
                            {option.label}
                          </Button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Útil si la recurrencia depende de días concretos de la semana.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routine-days-of-month">Días del mes</Label>
                    <Input
                      id="routine-days-of-month"
                      placeholder="Ej: 1, 15, 28"
                      value={recurrenceDaysOfMonth}
                      onChange={(event) => setRecurrenceDaysOfMonth(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separados por coma. Sirve para recurrencias por fecha de mes.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="routine-max-occurrences">Máximo de ocurrencias</Label>
                      <Input
                        id="routine-max-occurrences"
                        type="number"
                        min={1}
                        step={1}
                        value={recurrenceMaxOccurrences}
                        onChange={(event) => setRecurrenceMaxOccurrences(event.target.value)}
                        placeholder="Ej: 12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="routine-last-period-start">Inicio del último período</Label>
                      <Input
                        id="routine-last-period-start"
                        type="datetime-local"
                        value={recurrenceLastPeriodStart}
                        onChange={(event) => setRecurrenceLastPeriodStart(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="routine-end-date">Fecha de fin</Label>
                      <Input
                        id="routine-end-date"
                        type="datetime-local"
                        value={recurrenceEndDate}
                        onChange={(event) => setRecurrenceEndDate(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleCreateRoutine}
              disabled={createRoutineMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear rutina
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Mis rutinas</CardTitle>
            <CardDescription>
              Selecciona una rutina para ver su detalle y ejecutar validación DAG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-4 text-sm text-destructive">
                Error al cargar rutinas: {error.message}
              </p>
            )}

            {routines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay rutinas creadas todavía.</p>
            ) : (
              <div className="space-y-3">
                {routines.map((routine) => {
                  const isSelected = routine.id === selectedRoutineId

                  return (
                    <button
                      key={routine.id}
                      type="button"
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedRoutineId(routine.id)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{routine.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {routine.description ?? "Sin descripción"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={routine.isActive ? "default" : "secondary"}>
                            {routine.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteRoutine(routine.id)
                            }}
                            disabled={deleteRoutineMutation.isPending}
                            aria-label="Eliminar rutina"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${routine.id}`} className="text-xs text-muted-foreground">
                            Activa
                          </Label>
                          <Switch
                            id={`active-${routine.id}`}
                            checked={routine.isActive}
                            onCheckedChange={(checked) => handleToggleRoutine(routine, checked)}
                            onClick={(event) => event.stopPropagation()}
                            disabled={updateRoutineMutation.isPending}
                          />
                        </div>

                        <span className="text-xs text-muted-foreground">
                          Recurrencia: {getRecurrenceLabel(routine)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedRoutine && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Detalle de rutina: {selectedRoutine.name}</CardTitle>
                <CardDescription>Vista de tareas y dependencias para validar DAG en frontend v2.</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleValidateSelectedRoutine}
                disabled={validateDagQuery.isFetching}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Validar DAG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <p className="text-sm text-muted-foreground">Cargando detalle...</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ListTodo className="h-4 w-4" />
                      <h4 className="font-medium">Tareas en rutina</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoutineDetails?.tasks.length ?? 0} tareas asociadas
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <select
                          className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={taskIdToAdd}
                          onChange={(event) => setTaskIdToAdd(event.target.value)}
                        >
                          <option value="">Agregar tarea existente</option>
                          {availableTasks.map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          onClick={handleAddTaskToRoutine}
                          disabled={addTaskMutation.isPending}
                        >
                          Agregar
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {(selectedRoutineDetails?.routineTasks ?? []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">Sin tareas vinculadas.</p>
                        ) : (
                          (selectedRoutineDetails?.routineTasks ?? []).map((routineTask) => {
                            const linkedTask = (selectedRoutineDetails?.tasks ?? []).find(
                              (task) => task.id === routineTask.taskId,
                            )

                            return (
                              <div
                                key={`${routineTask.routineId}-${routineTask.taskId}`}
                                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {linkedTask?.name ?? `Task #${routineTask.taskId}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Orden: {routineTask.order}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveTaskFromRoutine(routineTask.taskId)}
                                  disabled={removeTaskMutation.isPending}
                                  aria-label="Quitar tarea"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <h4 className="font-medium">Dependencias</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoutineDetails?.edges.length ?? 0} aristas registradas
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={dependencyFromTaskId}
                          onChange={(event) => setDependencyFromTaskId(event.target.value)}
                        >
                          <option value="">Desde</option>
                          {(selectedRoutineDetails?.tasks ?? []).map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={dependencyToTaskId}
                          onChange={(event) => setDependencyToTaskId(event.target.value)}
                        >
                          <option value="">Hacia</option>
                          {(selectedRoutineDetails?.tasks ?? []).map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={dependencyType}
                          onChange={(event) => setDependencyType(event.target.value as "ORDER" | "DEPENDENCY")}
                        >
                          <option value="DEPENDENCY">DEPENDENCY</option>
                          <option value="ORDER">ORDER</option>
                        </select>
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleAddDependency}
                        disabled={addDependencyMutation.isPending}
                      >
                        Agregar dependencia
                      </Button>

                      <div className="space-y-2">
                        {(selectedRoutineDetails?.edges ?? []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">Sin dependencias registradas.</p>
                        ) : (
                          (selectedRoutineDetails?.edges ?? []).map((edge) => (
                            <div
                              key={`${edge.fromTaskId}-${edge.toTaskId}-${edge.edgeType}`}
                              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {edge.fromTaskId} → {edge.toTaskId}
                                </p>
                                <p className="text-xs text-muted-foreground">Tipo: {edge.edgeType}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDependency(edge.fromTaskId, edge.toTaskId, edge.edgeType)}
                                disabled={removeDependencyMutation.isPending}
                                aria-label="Quitar dependencia"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

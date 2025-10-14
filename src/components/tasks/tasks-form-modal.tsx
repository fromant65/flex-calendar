"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "~/trpc/react"
import { ChevronDown, ChevronUp, Calendar, Repeat, Target, Info } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { Badge } from "~/components/ui/badge"

type TaskType = "unique" | "finite" | "habit" | "habit-plus"

type TaskWithRecurrence = {
  id: number
  name: string
  description: string | null
  importance: number
  isActive: boolean
  recurrenceId: number | null
  recurrence?: {
    id: number
    interval: number | null
    daysOfWeek: string[] | null
    daysOfMonth: number[] | null
    maxOccurrences: number | null
    endDate: Date | null
  } | null
}

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask?: TaskWithRecurrence | null
  onSuccess: () => void
}

export function TaskFormModal({ open, onOpenChange, editingTask, onSuccess }: TaskFormModalProps) {
  const [taskType, setTaskType] = useState<TaskType>("unique")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    importance: 5,
    interval: 1,
    daysOfWeek: [] as string[],
    daysOfMonth: [] as number[],
    maxOccurrences: undefined as number | undefined,
    endDate: undefined as string | undefined,
    targetDate: undefined as string | undefined,
    limitDate: undefined as string | undefined,
    targetTimeConsumption: undefined as number | undefined,
  })

  const createMutation = api.task.create.useMutation({ onSuccess })
  const updateMutation = api.task.update.useMutation({ onSuccess })

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        description: editingTask.description || "",
        importance: editingTask.importance,
        interval: editingTask.recurrence?.interval || 1,
        daysOfWeek: (editingTask.recurrence?.daysOfWeek as string[]) || [],
        daysOfMonth: editingTask.recurrence?.daysOfMonth || [],
        maxOccurrences: editingTask.recurrence?.maxOccurrences || undefined,
        endDate: editingTask.recurrence?.endDate
          ? new Date(editingTask.recurrence.endDate).toISOString().split("T")[0]
          : undefined,
        targetDate: undefined,
        limitDate: undefined,
        targetTimeConsumption: undefined,
      })
    } else {
      resetForm()
    }
  }, [editingTask, open])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      importance: 5,
      interval: 1,
      daysOfWeek: [],
      daysOfMonth: [],
      maxOccurrences: undefined,
      endDate: undefined,
      targetDate: undefined,
      limitDate: undefined,
      targetTimeConsumption: undefined,
    })
    setTaskType("unique")
    setShowAdvanced(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const recurrence =
      taskType === "unique"
        ? {
            maxOccurrences: 1, // Unique tasks have exactly 1 occurrence
          }
        : taskType === "finite"
          ? {
              maxOccurrences: formData.maxOccurrences,
              endDate: formData.endDate ? new Date(formData.endDate) : undefined,
            }
          : taskType === "habit"
            ? {
                interval: formData.interval,
                maxOccurrences: 1, // 1 occurrence per period
                lastPeriodStart: new Date(), // Start period now
              }
            : {
                // habit-plus
                interval: formData.interval,
                daysOfWeek:
                  formData.daysOfWeek.length > 0
                    ? (formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">)
                    : undefined,
                daysOfMonth: formData.daysOfMonth.length > 0 ? formData.daysOfMonth : undefined,
                maxOccurrences: formData.maxOccurrences,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                lastPeriodStart: new Date(), // Start period now
              }

    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: {
          name: formData.name,
          description: formData.description,
          importance: formData.importance,
        },
      })
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        importance: formData.importance,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        limitDate: formData.limitDate ? new Date(formData.limitDate) : undefined,
        targetTimeConsumption: formData.targetTimeConsumption,
        recurrence,
      })
    }
  }

  const toggleDayOfWeek = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
    }))
  }

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dayLabels: Record<string, string> = {
    Mon: "L",
    Tue: "M",
    Wed: "X",
    Thu: "J",
    Fri: "V",
    Sat: "S",
    Sun: "D",
  }

  const taskTypes = [
    { value: "unique" as TaskType, label: "Única", icon: Calendar, description: "Tarea de una sola vez" },
    { value: "finite" as TaskType, label: "Recurrente Finita", icon: Repeat, description: "Se repite N veces" },
    { value: "habit" as TaskType, label: "Hábito", icon: Target, description: "Se repite cada X días" },
    { value: "habit-plus" as TaskType, label: "Hábito +", icon: Target, description: "Hábito con opciones avanzadas" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{editingTask ? "Editar Tarea" : "Crear Nueva Tarea"}</DialogTitle>
          <DialogDescription>
            {editingTask
              ? "Modifica los detalles de tu tarea"
              : "Completa los campos para crear una nueva tarea o hábito"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">
                Nombre *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la tarea"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional"
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-foreground">Importancia</Label>
                <Badge variant="outline" className="font-mono">
                  {formData.importance}/10
                </Badge>
              </div>
              <Slider
                value={[formData.importance]}
                onValueChange={([value]) => setFormData({ ...formData, importance: value! })}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="targetTimeConsumption" className="text-foreground">
                Tiempo Objetivo (horas) - Opcional
              </Label>
              <Input
                id="targetTimeConsumption"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.targetTimeConsumption || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetTimeConsumption: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Ej: 2.5 horas"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Tiempo estimado que debería tomar completar esta tarea
              </p>
            </div>
          </div>

          {/* Task Type Selection */}
          {!editingTask && (
            <div className="space-y-3">
              <Label className="text-foreground">Tipo de Tarea</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {taskTypes.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTaskType(value)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      taskType === value
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                        : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        taskType === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target and limit dates for unique/finite when creating */}
          {!editingTask && (taskType === "unique" || taskType === "finite") && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="targetDate" className="text-foreground">
                  Fecha objetivo (Opcional)
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate || ""}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="limitDate" className="text-foreground">
                  Fecha límite (Opcional)
                </Label>
                <Input
                  id="limitDate"
                  type="date"
                  value={formData.limitDate || ""}
                  onChange={(e) => setFormData({ ...formData, limitDate: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Recurrence Options */}
          {!editingTask && taskType !== "unique" && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-4 w-4 text-primary" />
                Opciones de Recurrencia
              </div>

              {taskType === "finite" && (
                <>
                  {taskType === "finite" && (
                    <div>
                      <Label htmlFor="maxOccurrences" className="text-foreground">
                        Número de Ocurrencias
                      </Label>
                      <Input
                        id="maxOccurrences"
                        type="number"
                        min="1"
                        value={formData.maxOccurrences || ""}
                        onChange={(e) => setFormData({ ...formData, maxOccurrences: Number.parseInt(e.target.value) })}
                        placeholder="Ej: 10"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="endDate" className="text-foreground">
                      Fecha de Finalización (Opcional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </>
              )}

              {(taskType === "habit" || taskType === "habit-plus") && (
                <>
                  <div>
                    <Label htmlFor="interval" className="text-foreground">
                      Intervalo (días)
                    </Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: Number.parseInt(e.target.value) })}
                      className="mt-1.5"
                    />
                  </div>

                  {taskType === "habit-plus" && (
                    <>
                      <div>
                        <Label htmlFor="maxOccurrences" className="text-foreground">
                          Ocurrencias por Periodo
                        </Label>
                        <Input
                          id="maxOccurrences"
                          type="number"
                          min="1"
                          value={formData.maxOccurrences || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxOccurrences: Number.parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="Ej: 3 veces por periodo"
                          className="mt-1.5"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        Opciones Avanzadas
                      </button>

                      {showAdvanced && (
                        <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
                          <div>
                            <Label className="text-foreground">Días de la Semana</Label>
                            <div className="mt-2 flex gap-2">
                              {daysOfWeek.map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleDayOfWeek(day)}
                                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all ${
                                    formData.daysOfWeek.includes(day)
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted"
                                  }`}
                                >
                                  {dayLabels[day]}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="daysOfMonth" className="text-foreground">
                              Días del Mes (separados por coma)
                            </Label>
                            <Input
                              id="daysOfMonth"
                              value={formData.daysOfMonth.join(", ")}
                              onChange={(e) => {
                                const days = e.target.value
                                  .split(",")
                                  .map((d) => Number.parseInt(d.trim()))
                                  .filter((d) => !isNaN(d) && d >= 1 && d <= 31)
                                setFormData({ ...formData, daysOfMonth: days })
                              }}
                              placeholder="Ej: 1, 15, 30"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label htmlFor="endDate" className="text-foreground">
                              Fecha de Fin
                            </Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formData.endDate || ""}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
              {editingTask ? "Actualizar Tarea" : "Crear Tarea"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

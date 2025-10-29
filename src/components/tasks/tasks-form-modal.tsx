"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "~/trpc/react"
import type { TaskWithRecurrence } from "~/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import HelpTip from "~/components/ui/help-tip"
import { Button } from "~/components/ui/button"
import { LoadingSpinner } from "~/components/ui/loading-spinner"
import { toast } from "sonner"
import { TaskBasicInfo } from "./form/task-basic-info"
import { TaskTypeSelector, type FormTaskType } from "./form/task-type-selector"
import { FixedUniqueForm } from "./form/fixed-unique-form"
import { FixedRepetitiveForm } from "./form/fixed-repetitive-form"
import { TargetLimitDates } from "./form/target-limit-dates"
import { RecurrenceOptions } from "./form/recurrence-options"
import { HabitPlusRecurrence } from "./form/habit-plus-recurrence"
import { FiniteRecurrence } from "./form/finite-recurrence"

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask?: TaskWithRecurrence | null
  onSuccess: () => void
}

export function TaskFormModal({ open, onOpenChange, editingTask, onSuccess }: TaskFormModalProps) {
  const [taskType, setTaskType] = useState<FormTaskType>("unique")
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
    fixedDate: undefined as string | undefined,
    fixedStartTime: "",
    fixedEndTime: "",
  })

  const utils = api.useUtils()

  const createMutation = api.task.create.useMutation({
    onSuccess: async () => {
      toast.success("Tarea creada exitosamente", {
        description: `"${formData.name}" ha sido agregada a tu lista de tareas`,
      })
      // Invalidate tasks list so pages refresh
      await utils.task.getMyTasks.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error("Error al crear tarea", {
        description: error.message || "Hubo un problema al crear la tarea",
      })
    },
  })

  const updateMutation = api.task.update.useMutation({
    onSuccess: async () => {
      toast.success("Tarea actualizada", {
        description: "Los cambios han sido guardados correctamente",
      })
      await utils.task.getMyTasks.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error("Error al actualizar tarea", {
        description: error.message || "Hubo un problema al actualizar la tarea",
      })
    },
  })

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        description: editingTask.description || "",
        importance: editingTask.importance,
        interval: editingTask.recurrence?.interval || 1,
        daysOfWeek: (editingTask.recurrence?.daysOfWeek!) || [],
        daysOfMonth: editingTask.recurrence?.daysOfMonth || [],
        maxOccurrences: editingTask.recurrence?.maxOccurrences || undefined,
        endDate: editingTask.recurrence?.endDate
          ? new Date(editingTask.recurrence.endDate).toISOString().split("T")[0]
          : undefined,
        targetDate: undefined,
        limitDate: undefined,
        targetTimeConsumption: undefined,
        fixedDate: undefined,
        fixedStartTime: editingTask.fixedStartTime || "",
        fixedEndTime: editingTask.fixedEndTime || "",
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
      fixedDate: undefined,
      fixedStartTime: "",
      fixedEndTime: "",
    })
    setTaskType("unique")
    setShowAdvanced(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isFixed = taskType === "fixed-unique" || taskType === "fixed-repetitive"

    // Validation for fixed tasks
    if (isFixed) {
      if (!formData.fixedStartTime || !formData.fixedEndTime) {
        alert("Las tareas fijas deben tener horario de inicio y fin")
        return
      }
      if (taskType === "fixed-unique" && !formData.fixedDate) {
        alert("Las tareas fijas únicas deben tener una fecha definida")
        return
      }
      if (taskType === "fixed-repetitive") {
        if (!formData.daysOfWeek.length && !formData.daysOfMonth.length) {
          alert("Las tareas fijas repetitivas deben tener días de la semana o del mes definidos")
          return
        }
        if (!formData.endDate) {
          alert("Las tareas fijas repetitivas deben tener una fecha de finalización para evitar generar eventos infinitamente")
          return
        }
      }
    }

    // Build recurrence object based on task type, ensuring only ONE type of recurrence is set
    let recurrence: Record<string, any> | undefined;
    
    if (taskType === "unique") {
      recurrence = {
        maxOccurrences: 1, // Unique tasks have exactly 1 occurrence
      };
    } else if (taskType === "finite") {
      recurrence = {
        maxOccurrences: formData.maxOccurrences,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };
      
      // Only set ONE type of recurrence pattern (daysOfWeek OR daysOfMonth, never both or with interval)
      if (formData.daysOfWeek.length > 0) {
        recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
      } else if (formData.daysOfMonth.length > 0) {
        recurrence.daysOfMonth = formData.daysOfMonth;
      }
    } else if (taskType === "habit") {
      // Habit only uses interval, no daysOfWeek or daysOfMonth
      recurrence = {
        interval: formData.interval,
        maxOccurrences: 1, // 1 occurrence per period
        lastPeriodStart: new Date(), // Start period now
      };
    } else if (taskType === "habit-plus") {
      // Habit+ uses interval AND (daysOfWeek OR daysOfMonth), but never both
      recurrence = {
        interval: formData.interval,
        maxOccurrences: formData.maxOccurrences,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        lastPeriodStart: new Date(), // Start period now
      };
      
      // Only set ONE type of day pattern
      if (formData.daysOfWeek.length > 0) {
        recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
      } else if (formData.daysOfMonth.length > 0) {
        recurrence.daysOfMonth = formData.daysOfMonth;
      }
    } else if (taskType === "fixed-unique") {
      // Fixed unique tasks don't need daysOfWeek - they use targetDate instead
      recurrence = {
        maxOccurrences: 1,
      };
    } else if (taskType === "fixed-repetitive") {
      recurrence = {
        endDate: new Date(formData.endDate!), // Required for fixed-repetitive
      };
      
      // Only set ONE type of recurrence pattern
      if (formData.daysOfWeek.length > 0) {
        recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
      } else if (formData.daysOfMonth.length > 0) {
        recurrence.daysOfMonth = formData.daysOfMonth;
      }
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
        targetDate:
          taskType === "fixed-unique" && formData.fixedDate
            ? new Date(formData.fixedDate)
            : formData.targetDate
              ? new Date(formData.targetDate)
              : undefined,
        limitDate: formData.limitDate ? new Date(formData.limitDate) : undefined,
        targetTimeConsumption: formData.targetTimeConsumption,
        isFixed: isFixed,
        fixedStartTime: isFixed ? `${formData.fixedStartTime}:00` : undefined,
        fixedEndTime: isFixed ? `${formData.fixedEndTime}:00` : undefined,
        recurrence,
      })
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{editingTask ? "Editar Tarea" : "Crear Nueva Tarea"}</DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Modifica los detalles de tu tarea"
                  : "Completa los campos para crear una nueva tarea o hábito"}
              </DialogDescription>
            </div>
            <HelpTip title="Tipos de tarea" side="bottom">
              <p className="mb-1">
                Única: una sola ocurrencia. <br />
                Recurrente (Finita): se repite según intervalo/días, una cantidad definida de veces. <br />
                Hábito: una ocurrencia por periodo. <br />
                Hábito +: una o más ocurrencias por periodo, con la capacidad de definir días específicos de ocurrencia. <br />
                Fija Única: asigna hora y/o fecha fijas para una única ocurrencia. <br />
                Fija Repetitiva: asigna hora fija y días específicos para una cantidad definida de ocurrencias.
              </p>
              <p className="text-xs text-muted-foreground">El tipo determina qué campos adicionales aparecen en este formulario (fechas, recurrencia, horarios fijos).</p>
            </HelpTip>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <TaskBasicInfo
            name={formData.name}
            description={formData.description}
            importance={formData.importance}
            targetTimeConsumption={formData.targetTimeConsumption}
            onNameChange={(value) => setFormData({ ...formData, name: value })}
            onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
            onImportanceChange={(value) => setFormData({ ...formData, importance: value })}
            onTargetTimeChange={(value) => setFormData({ ...formData, targetTimeConsumption: value })}
          />

          {/* removed inline HelpTip that was in middle of form to keep top placement */}

          {/* Task Type Selection */}
          {!editingTask && (
            <TaskTypeSelector
              selectedType={taskType}
              onTypeChange={setTaskType}
            />
          )}

          {/* Fixed Unique Task - Date and Times */}
          {!editingTask && taskType === "fixed-unique" && (
            <FixedUniqueForm
              fixedDate={formData.fixedDate}
              fixedStartTime={formData.fixedStartTime}
              fixedEndTime={formData.fixedEndTime}
              onFixedDateChange={(value) => setFormData({ ...formData, fixedDate: value })}
              onFixedStartTimeChange={(value) => setFormData({ ...formData, fixedStartTime: value })}
              onFixedEndTimeChange={(value) => setFormData({ ...formData, fixedEndTime: value })}
            />
          )}

          {/* Fixed Repetitive Task - Days and Times */}
          {!editingTask && taskType === "fixed-repetitive" && (
            <FixedRepetitiveForm
              daysOfWeek={formData.daysOfWeek}
              daysOfMonth={formData.daysOfMonth}
              fixedStartTime={formData.fixedStartTime}
              fixedEndTime={formData.fixedEndTime}
              endDate={formData.endDate}
              onDaysOfWeekChange={(days) => setFormData({ ...formData, daysOfWeek: days })}
              onDaysOfMonthChange={(days) => setFormData({ ...formData, daysOfMonth: days })}
              onFixedStartTimeChange={(value) => setFormData({ ...formData, fixedStartTime: value })}
              onFixedEndTimeChange={(value) => setFormData({ ...formData, fixedEndTime: value })}
              onEndDateChange={(value) => setFormData({ ...formData, endDate: value })}
            />
          )}

          {/* Target and limit dates for unique/finite when creating */}
          {!editingTask && taskType === "unique" && (
            <TargetLimitDates
              targetDate={formData.targetDate}
              limitDate={formData.limitDate}
              onTargetDateChange={(value) => setFormData({ ...formData, targetDate: value })}
              onLimitDateChange={(value) => setFormData({ ...formData, limitDate: value })}
            />
          )}

          {/* Finite Recurrence with pattern selection */}
          {!editingTask && taskType === "finite" && (
            <>
              <TargetLimitDates
                targetDate={formData.targetDate}
                limitDate={formData.limitDate}
                onTargetDateChange={(value) => setFormData({ ...formData, targetDate: value })}
                onLimitDateChange={(value) => setFormData({ ...formData, limitDate: value })}
              />
              <FiniteRecurrence
                maxOccurrences={formData.maxOccurrences}
                daysOfWeek={formData.daysOfWeek}
                daysOfMonth={formData.daysOfMonth}
                endDate={formData.endDate}
                onMaxOccurrencesChange={(value) => setFormData({ ...formData, maxOccurrences: value })}
                onDaysOfWeekChange={(days) => setFormData({ ...formData, daysOfWeek: days })}
                onDaysOfMonthChange={(days) => setFormData({ ...formData, daysOfMonth: days })}
                onEndDateChange={(value) => setFormData({ ...formData, endDate: value })}
              />
            </>
          )}

          {/* Habit Recurrence (simple interval) */}
          {!editingTask && taskType === "habit" && (
            <RecurrenceOptions
              taskType={taskType}
              interval={formData.interval}
              maxOccurrences={formData.maxOccurrences}
              daysOfWeek={formData.daysOfWeek}
              daysOfMonth={formData.daysOfMonth}
              endDate={formData.endDate}
              showAdvanced={showAdvanced}
              onIntervalChange={(value) => setFormData({ ...formData, interval: value })}
              onMaxOccurrencesChange={(value) => setFormData({ ...formData, maxOccurrences: value })}
              onDaysOfWeekChange={(days) => setFormData({ ...formData, daysOfWeek: days })}
              onDaysOfMonthChange={(days) => setFormData({ ...formData, daysOfMonth: days })}
              onEndDateChange={(value) => setFormData({ ...formData, endDate: value })}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />
          )}

          {/* Habit+ Recurrence with mode selection */}
          {!editingTask && taskType === "habit-plus" && (
            <HabitPlusRecurrence
              interval={formData.interval}
              maxOccurrences={formData.maxOccurrences}
              daysOfWeek={formData.daysOfWeek}
              daysOfMonth={formData.daysOfMonth}
              endDate={formData.endDate}
              onIntervalChange={(value) => setFormData({ ...formData, interval: value })}
              onMaxOccurrencesChange={(value) => setFormData({ ...formData, maxOccurrences: value })}
              onDaysOfWeekChange={(days) => setFormData({ ...formData, daysOfWeek: days })}
              onDaysOfMonthChange={(days) => setFormData({ ...formData, daysOfMonth: days })}
              onEndDateChange={(value) => setFormData({ ...formData, endDate: value })}
            />
          )}

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 cursor-pointer">
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="xs" />
                  <span className="ml-2">{editingTask ? "Actualizando..." : "Creando..."}</span>
                </>
              ) : (
                editingTask ? "Actualizar Tarea" : "Crear Tarea"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

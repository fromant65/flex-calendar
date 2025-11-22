/**
 * useTaskForm - Custom hook for task form state and logic
 */

import { useState, useEffect } from "react"
import { api } from "~/trpc/react"
import type { TaskWithRecurrence, TaskWithDetails } from "~/types"
import type { FormTaskType } from "./task-type-selector"
import { toast } from "sonner"
import {
  getTaskTypeFromTask,
  extractDatesFromTask,
  validateFixedTask,
  buildRecurrence,
  buildDates,
} from "./task-form-logic"

interface UseTaskFormProps {
  open: boolean
  editingTask?: TaskWithRecurrence | null
  duplicatingTask?: TaskWithDetails | null
  onSuccess: () => void
}

export interface TaskFormState {
  name: string
  description: string
  importance: number
  interval: number
  daysOfWeek: string[]
  daysOfMonth: number[]
  maxOccurrences?: number
  endDate?: string
  targetDate?: string
  limitDate?: string
  fixedDate?: string
  fixedStartTime: string
  fixedEndTime: string
}

const initialFormState: TaskFormState = {
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
  fixedDate: undefined,
  fixedStartTime: "",
  fixedEndTime: "",
}

export function useTaskForm({ open, editingTask, duplicatingTask, onSuccess }: UseTaskFormProps) {
  const [taskType, setTaskType] = useState<FormTaskType>("unique")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TaskFormState>(initialFormState)
  const [currentPage, setCurrentPage] = useState<1 | 2>(1)

  const utils = api.useUtils()

  // Mutations
  const createMutation = api.task.create.useMutation({
    onSuccess: async () => {
      toast.success("Tarea creada exitosamente", {
        description: `"${formData.name}" ha sido agregada a tu lista de tareas`,
      })
      await utils.task.getMyTasks.invalidate()
      // Invalidate events and occurrences for fixed tasks (they create events automatically)
      await utils.calendarEvent.getMyEventsWithDetails.invalidate()
      await utils.occurrence.invalidate() // Invalidates all occurrence queries including getByDateRange
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

  // Initialize form when opening or when task changes
  useEffect(() => {
    const taskToPopulate = editingTask || duplicatingTask;
    
    if (taskToPopulate) {
      // When duplicating, detect and set the task type
      if (duplicatingTask) {
        setTaskType(getTaskTypeFromTask(duplicatingTask))
      }
      
      // Extract dates from nextOccurrence if available (for duplicating)
      const { extractedTargetDate, extractedLimitDate, extractedFixedDate } = 
        duplicatingTask ? extractDatesFromTask(duplicatingTask) : 
        { extractedTargetDate: undefined, extractedLimitDate: undefined, extractedFixedDate: undefined };
      
      setFormData({
        name: taskToPopulate.name,
        description: taskToPopulate.description || "",
        importance: taskToPopulate.importance,
        interval: taskToPopulate.recurrence?.interval || 1,
        daysOfWeek: (taskToPopulate.recurrence?.daysOfWeek!) || [],
        daysOfMonth: taskToPopulate.recurrence?.daysOfMonth || [],
        maxOccurrences: taskToPopulate.recurrence?.maxOccurrences || undefined,
        endDate: taskToPopulate.recurrence?.endDate
          ? new Date(taskToPopulate.recurrence.endDate).toISOString().split("T")[0]
          : undefined,
        targetDate: extractedTargetDate,
        limitDate: extractedLimitDate,
        fixedDate: extractedFixedDate,
        // Convert HH:MM:SS to HH:MM for time inputs
        fixedStartTime: taskToPopulate.fixedStartTime 
          ? taskToPopulate.fixedStartTime.substring(0, 5) 
          : "",
        fixedEndTime: taskToPopulate.fixedEndTime 
          ? taskToPopulate.fixedEndTime.substring(0, 5) 
          : "",
      })
    } else {
      resetForm()
    }
  }, [editingTask, duplicatingTask, open])

  // Clear validation error when relevant fields change
  useEffect(() => {
    if (validationError) {
      setValidationError(null)
    }
  }, [formData.fixedStartTime, formData.fixedEndTime, formData.fixedDate, formData.daysOfWeek, formData.daysOfMonth, formData.endDate])

  const resetForm = () => {
    setFormData(initialFormState)
    setTaskType("unique")
    setShowAdvanced(false)
    setValidationError(null)
    setCurrentPage(1)
  }

  const updateFormData = (data: Partial<TaskFormState>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const validateBasicInfo = (): string | null => {
    if (!formData.name.trim()) {
      return "El nombre de la tarea es obligatorio"
    }
    return null
  }

  const goToNextPage = () => {
    const error = validateBasicInfo()
    if (error) {
      setValidationError(error)
      return false
    }
    setValidationError(null)
    setCurrentPage(2)
    return true
  }

  const goToPreviousPage = () => {
    setValidationError(null)
    setCurrentPage(1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous validation errors
    setValidationError(null)

    // Validate fixed tasks
    const validationErr = validateFixedTask(taskType, formData)
    if (validationErr) {
      setValidationError(validationErr)
      return
    }

    // Build recurrence
    const recurrence = buildRecurrence(taskType, formData)

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
      // Build dates
      const datesResult = buildDates(taskType, formData)
      
      if (datesResult.error) {
        setValidationError(datesResult.error)
        return
      }

      const isFixed = taskType === "fixed-unique" || taskType === "fixed-repetitive"
      
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        importance: formData.importance,
        targetDate: datesResult.targetDate,
        limitDate: datesResult.limitDate,
        isFixed,
        recurrence,
      })
    }
  }

  return {
    taskType,
    setTaskType,
    showAdvanced,
    setShowAdvanced,
    validationError,
    formData,
    updateFormData,
    handleSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
    isEditing: !!editingTask,
    isDuplicating: !!duplicatingTask,
    currentPage,
    goToNextPage,
    goToPreviousPage,
  }
}

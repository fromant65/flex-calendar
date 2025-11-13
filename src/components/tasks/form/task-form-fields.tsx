import type { FormTaskType } from "./task-type-selector"
import { TaskTypeSelector } from "./task-type-selector"
import { FixedUniqueForm } from "./fixed-unique-form"
import { FixedRepetitiveForm } from "./fixed-repetitive-form"
import { TargetLimitDates } from "./target-limit-dates"
import { RecurrenceOptions } from "./recurrence-options"
import { HabitPlusRecurrence } from "./habit-plus-recurrence"
import { FiniteRecurrence } from "./finite-recurrence"

export interface TaskFormData {
  fixedDate?: string
  fixedStartTime: string
  fixedEndTime: string
  targetDate?: string
  limitDate?: string
  daysOfWeek: string[]
  daysOfMonth: number[]
  endDate?: string
  interval: number
  maxOccurrences?: number
}

interface TaskFormFieldsProps {
  taskType: FormTaskType
  isEditing: boolean
  showAdvanced: boolean
  validationError: string | null
  formData: TaskFormData
  onTaskTypeChange: (type: FormTaskType) => void
  onFormDataChange: (data: Partial<TaskFormData>) => void
  onToggleAdvanced: () => void
}

export function TaskFormFields({
  taskType,
  isEditing,
  showAdvanced,
  validationError,
  formData,
  onTaskTypeChange,
  onFormDataChange,
  onToggleAdvanced,
}: TaskFormFieldsProps) {
  return (
    <>
      {/* Task Type Selection */}
      {!isEditing && (
        <TaskTypeSelector
          selectedType={taskType}
          onTypeChange={onTaskTypeChange}
        />
      )}

      {/* Fixed Unique Task - Date and Times */}
      {!isEditing && taskType === "fixed-unique" && (
        <FixedUniqueForm
          fixedDate={formData.fixedDate}
          fixedStartTime={formData.fixedStartTime}
          fixedEndTime={formData.fixedEndTime}
          onFixedDateChange={(value) => onFormDataChange({ fixedDate: value })}
          onFixedStartTimeChange={(value) => onFormDataChange({ fixedStartTime: value })}
          onFixedEndTimeChange={(value) => onFormDataChange({ fixedEndTime: value })}
          validationError={validationError}
        />
      )}

      {/* Fixed Repetitive Task - Days and Times */}
      {!isEditing && taskType === "fixed-repetitive" && (
        <FixedRepetitiveForm
          daysOfWeek={formData.daysOfWeek}
          daysOfMonth={formData.daysOfMonth}
          fixedStartTime={formData.fixedStartTime}
          fixedEndTime={formData.fixedEndTime}
          endDate={formData.endDate}
          onDaysOfWeekChange={(days) => onFormDataChange({ daysOfWeek: days })}
          onDaysOfMonthChange={(days) => onFormDataChange({ daysOfMonth: days })}
          onFixedStartTimeChange={(value) => onFormDataChange({ fixedStartTime: value })}
          onFixedEndTimeChange={(value) => onFormDataChange({ fixedEndTime: value })}
          onEndDateChange={(value) => onFormDataChange({ endDate: value })}
          validationError={validationError}
        />
      )}

      {/* Target and limit dates for unique/finite when creating */}
      {!isEditing && taskType === "unique" && (
        <TargetLimitDates
          targetDate={formData.targetDate}
          limitDate={formData.limitDate}
          onTargetDateChange={(value) => onFormDataChange({ targetDate: value })}
          onLimitDateChange={(value) => onFormDataChange({ limitDate: value })}
        />
      )}

      {/* Finite Recurrence with pattern selection */}
      {!isEditing && taskType === "finite" && (
        <>
          <TargetLimitDates
            targetDate={formData.targetDate}
            limitDate={formData.limitDate}
            onTargetDateChange={(value) => onFormDataChange({ targetDate: value })}
            onLimitDateChange={(value) => onFormDataChange({ limitDate: value })}
          />
          <FiniteRecurrence
            maxOccurrences={formData.maxOccurrences}
            daysOfWeek={formData.daysOfWeek}
            daysOfMonth={formData.daysOfMonth}
            endDate={formData.endDate}
            onMaxOccurrencesChange={(value) => onFormDataChange({ maxOccurrences: value })}
            onDaysOfWeekChange={(days) => onFormDataChange({ daysOfWeek: days })}
            onDaysOfMonthChange={(days) => onFormDataChange({ daysOfMonth: days })}
            onEndDateChange={(value) => onFormDataChange({ endDate: value })}
          />
        </>
      )}

      {/* Habit Recurrence (simple interval) */}
      {!isEditing && taskType === "habit" && (
        <RecurrenceOptions
          taskType={taskType}
          interval={formData.interval}
          maxOccurrences={formData.maxOccurrences}
          daysOfWeek={formData.daysOfWeek}
          daysOfMonth={formData.daysOfMonth}
          endDate={formData.endDate}
          showAdvanced={showAdvanced}
          onIntervalChange={(value) => onFormDataChange({ interval: value })}
          onMaxOccurrencesChange={(value) => onFormDataChange({ maxOccurrences: value })}
          onDaysOfWeekChange={(days) => onFormDataChange({ daysOfWeek: days })}
          onDaysOfMonthChange={(days) => onFormDataChange({ daysOfMonth: days })}
          onEndDateChange={(value) => onFormDataChange({ endDate: value })}
          onToggleAdvanced={onToggleAdvanced}
        />
      )}

      {/* Habit+ Recurrence with mode selection */}
      {!isEditing && taskType === "habit-plus" && (
        <HabitPlusRecurrence
          interval={formData.interval}
          maxOccurrences={formData.maxOccurrences}
          daysOfWeek={formData.daysOfWeek}
          daysOfMonth={formData.daysOfMonth}
          endDate={formData.endDate}
          onIntervalChange={(value) => onFormDataChange({ interval: value })}
          onMaxOccurrencesChange={(value) => onFormDataChange({ maxOccurrences: value })}
          onDaysOfWeekChange={(days) => onFormDataChange({ daysOfWeek: days })}
          onDaysOfMonthChange={(days) => onFormDataChange({ daysOfMonth: days })}
          onEndDateChange={(value) => onFormDataChange({ endDate: value })}
        />
      )}
    </>
  )
}

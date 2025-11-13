"use client"

import type { TaskWithRecurrence, TaskWithDetails } from "~/types"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { LoadingSpinner } from "~/components/ui/loading-spinner"
import { TaskFormHeader } from "./form/task-form-header"
import { TaskFormPage1 } from "./form/task-form-page-1"
import { TaskFormPage2 } from "./form/task-form-page-2"
import { useTaskForm } from "./form/useTaskForm"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTask?: TaskWithRecurrence | null
  duplicatingTask?: TaskWithDetails | null
  onSuccess: () => void
}

export function TaskFormModal({ open, onOpenChange, editingTask, duplicatingTask, onSuccess }: TaskFormModalProps) {
  const {
    taskType,
    setTaskType,
    showAdvanced,
    setShowAdvanced,
    validationError,
    formData,
    updateFormData,
    handleSubmit,
    isLoading,
    isEditing,
    isDuplicating,
    currentPage,
    goToNextPage,
    goToPreviousPage,
  } = useTaskForm({ open, editingTask, duplicatingTask, onSuccess })

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    goToNextPage()
  }

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    goToPreviousPage()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]" showCloseButton={false}>
        <TaskFormHeader isEditing={isEditing} isDuplicating={isDuplicating} />

        {/* Page Indicator */}
        {!isEditing && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <div className={`h-2 w-2 rounded-full transition-colors ${currentPage === 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-2 rounded-full transition-colors ${currentPage === 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page 1: Basic Info Only */}
          {currentPage === 1 && (
            <TaskFormPage1
              name={formData.name}
              description={formData.description}
              importance={formData.importance}
              onNameChange={(value) => updateFormData({ name: value })}
              onDescriptionChange={(value) => updateFormData({ description: value })}
              onImportanceChange={(value) => updateFormData({ importance: value })}
            />
          )}

          {/* Page 2: Task Type & Type-specific Fields */}
          {currentPage === 2 && (
            <TaskFormPage2
              taskType={taskType}
              isEditing={isEditing}
              showAdvanced={showAdvanced}
              validationError={validationError}
              formData={formData}
              onTaskTypeChange={setTaskType}
              onFormDataChange={updateFormData}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />
          )}

          {/* Validation Error Display */}
          {validationError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {validationError}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3">
            {/* Back Button - Only on page 2 when creating */}
            {!isEditing && currentPage === 2 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
            )}

            {/* Next Button - Only on page 1 when creating */}
            {!isEditing && currentPage === 1 && (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 cursor-pointer"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {/* Submit Button - On page 2 or when editing */}
            {(isEditing || currentPage === 2) && (
              <Button type="submit" disabled={isLoading} className="flex-1 cursor-pointer">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="xs" />
                    <span className="ml-2">{isEditing ? "Actualizando..." : "Creando..."}</span>
                  </>
                ) : (
                  isEditing ? "Actualizar Tarea" : "Crear Tarea"
                )}
              </Button>
            )}

            {/* Cancel Button */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading} 
              className="cursor-pointer"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

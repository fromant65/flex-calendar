"use client"

import { useState, useEffect } from "react"
import { api } from "~/trpc/react"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import {
  TaskFormModal,
  TasksHeader,
  EmptyState,
  TasksContent,
  DeleteConfirmDialog,
} from "~/components/tasks"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { type TaskFilter } from "~/components/tasks/task-filter-bar"
import { toast } from "sonner"

type TaskFromList = TaskGetMyTasksOutput[number]

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskFromList | null>(null)
  const [viewingTask, setViewingTask] = useState<TaskFromList | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [filters, setFilters] = useState<TaskFilter>({
    searchQuery: "",
    statusFilter: "all",
    taskTypeFilter: "all",
    fixedFilter: "all",
  })

  const { data: tasks = [], isLoading, error: tasksError } = api.task.getMyTasks.useQuery()
  const utils = api.useUtils()

  // Show query error as toast
  useEffect(() => {
    if (tasksError) {
      toast.error("Error al cargar tareas", { 
        description: tasksError.message || "No se pudieron cargar las tareas" 
      })
      console.error("Error fetching tasks:", tasksError)
    }
  }, [tasksError])

  const deleteMutation = api.task.delete.useMutation({
    onSuccess: async () => {
      toast.success("Tarea eliminada", {
        description: "La tarea y todos sus eventos asociados han sido eliminados",
      })
      await utils.task.getMyTasks.invalidate()
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    },
    onError: (error) => {
      toast.error("Error al eliminar tarea", {
        description: error.message || "Hubo un problema al eliminar la tarea",
      })
    },
  })

  const handleEdit = (task: TaskFromList) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    setTaskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate({ id: taskToDelete })
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  // Only show full-page loading on initial load
  if (isLoading && tasks.length === 0) {
    return <LoadingPage text="Cargando tareas..." />
  }

  return (
    <div className="min-h-screen bg-background">
      <TasksHeader onCreateClick={() => setIsFormOpen(true)} />

      <div className="container mx-auto px-6 py-8">
        {tasks.length === 0 ? (
          <EmptyState onCreateClick={() => setIsFormOpen(true)} />
        ) : (
          <TasksContent
            tasks={tasks}
            filters={filters}
            onFiltersChange={setFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={setViewingTask}
          />
        )}
      </div>

      <TaskFormModal
        open={isFormOpen}
        onOpenChange={handleFormClose}
        editingTask={editingTask}
        onSuccess={async () => {
          await utils.task.getMyTasks.invalidate()
          handleFormClose()
        }}
      />

      {viewingTask && (
        <TaskDetailsModal
          open={!!viewingTask}
          onOpenChange={(open) => !open && setViewingTask(null)}
          task={viewingTask}
          occurrence={null}
          event={null}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { api } from "~/trpc/react"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskFormModal } from "~/components/tasks/tasks-form-modal"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
import { LoadingPage } from "~/components/ui/loading-spinner"
import { TaskCard } from "~/components/tasks/task-card"
import { TaskStats } from "~/components/tasks/task-stats"
import { TasksHeader } from "~/components/tasks/tasks-header"
import { EmptyState } from "~/components/tasks/empty-state"
import { TaskFilterBar, type TaskFilter } from "~/components/tasks/task-filter-bar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
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
      toast.error("Error al cargar tareas", { description: tasksError.message || "No se pudieron cargar las tareas" })
      console.error("Error fetching tasks:", tasksError)
    }
  }, [tasksError])

  const deleteMutation = api.task.delete.useMutation({
    onSuccess: async () => {
      toast.success("Tarea eliminada", {
        description: "La tarea y todos sus eventos asociados han sido eliminados",
      })
      // Invalidate cached tasks to refresh the list
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

  // Calculate stats
  const activeTasks = tasks.filter((t) => t.isActive).length
  const fixedTasks = tasks.filter((t) => t.isFixed).length

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

      // Status filter
      if (filters.statusFilter === "active" && !task.isActive) return false;
      if (filters.statusFilter === "inactive" && task.isActive) return false;

      // Task type filter
      if (filters.taskTypeFilter !== "all" && task.taskType !== filters.taskTypeFilter) return false;

      // Fixed filter
      if (filters.fixedFilter === "fixed" && !task.isFixed) return false;
      if (filters.fixedFilter === "flexible" && task.isFixed) return false;

      return true;
    });
  }, [tasks, filters]);

  // Separate active and inactive tasks
  const activeTasksList = filteredTasks.filter((t) => t.isActive)
  const inactiveTasksList = filteredTasks.filter((t) => !t.isActive)

  if (isLoading) {
    return <LoadingPage text="Cargando tareas..." />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <TasksHeader onCreateClick={() => setIsFormOpen(true)} />

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {tasks.length > 0 && (
          <>
            <TaskStats totalTasks={tasks.length} activeTasks={activeTasks} fixedTasks={fixedTasks} />
            
            {/* Filter Bar */}
            <div className="mt-6 mb-6">
              <TaskFilterBar
                filters={filters}
                onFiltersChange={setFilters}
                totalTasks={tasks.length}
                filteredCount={filteredTasks.length}
              />
            </div>
          </>
        )}

        {tasks.length === 0 ? (
          <EmptyState onCreateClick={() => setIsFormOpen(true)} />
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron tareas con los filtros aplicados.</p>
            <button
              onClick={() =>
                setFilters({
                  searchQuery: "",
                  statusFilter: "all",
                  taskTypeFilter: "all",
                  fixedFilter: "all",
                })
              }
              className="mt-4 text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tasks Section */}
            {activeTasksList.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  Tareas Activas
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({activeTasksList.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeTasksList.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClick={setViewingTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Tasks Section */}
            {inactiveTasksList.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
                  Tareas Inactivas
                  <span className="ml-2 text-sm font-normal">
                    ({inactiveTasksList.length})
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inactiveTasksList.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClick={setViewingTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        open={isFormOpen}
        onOpenChange={handleFormClose}
        editingTask={editingTask}
        onSuccess={async () => {
          await utils.task.getMyTasks.invalidate()
          handleFormClose()
        }}
      />

      {/* Task Details Modal */}
      {viewingTask && (
        <TaskDetailsModal
          open={!!viewingTask}
          onOpenChange={(open) => !open && setViewingTask(null)}
          task={viewingTask}
          occurrence={null}
          event={null}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea y todas sus ocurrencias serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

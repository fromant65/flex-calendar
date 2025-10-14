"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { Plus, Pencil, Trash2, Calendar, Repeat, Target } from "lucide-react"
import { TaskFormModal } from "~/components/tasks/tasks-form-modal"
import { TaskDetailsModal } from "~/components/events/task-details-modal"
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
import { Badge } from "~/components/ui/badge"

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

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRecurrence | null>(null)
  const [viewingTask, setViewingTask] = useState<TaskWithRecurrence | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)

  const { data: tasks = [], refetch } = api.task.getMyTasks.useQuery()
  const deleteMutation = api.task.delete.useMutation({
    onSuccess: () => {
      refetch()
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    },
  })

  const handleEdit = (task: TaskWithRecurrence) => {
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

  const getTaskTypeLabel = (task: TaskWithRecurrence) => {
    if (!task.recurrence) return "Única"
    if (task.recurrence.maxOccurrences === 1 
        && !task.recurrence.interval) return "Única"
    if (task.recurrence.maxOccurrences && task.recurrence.maxOccurrences > 1 && !task.recurrence.interval) {
      return "Recurrente Finita"
    }
    if (task.recurrence.interval 
        && (!task.recurrence.maxOccurrences || task.recurrence.maxOccurrences <= 1)
        && !task.recurrence.daysOfWeek 
        && !task.recurrence.daysOfMonth) {
      return "Hábito"
    }
    return "Hábito +"
  }

  const getTaskTypeIcon = (task: TaskWithRecurrence) => {
    if (!task.recurrence || task.recurrence.maxOccurrences === 1) return <Calendar className="h-4 w-4" />
    if (task.recurrence.maxOccurrences && task.recurrence.maxOccurrences > 1 && !task.recurrence.interval) {
      return <Repeat className="h-4 w-4" />
    }
    return <Target className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestor de Tareas</h1>
              <p className="mt-1 text-sm text-muted-foreground">Crea y administra tus tareas y hábitos</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Nueva Tarea
            </button>
          </div>
        </div>
      </header>

      {/* Tasks Grid */}
      <div className="container mx-auto px-6 py-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/30 p-16 text-center backdrop-blur-sm">
            <div className="mb-4 rounded-full bg-muted/50 p-6">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">No hay tareas creadas</h3>
            <p className="mb-6 text-sm text-muted-foreground">Comienza creando tu primera tarea o hábito</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setViewingTask(task)}
                className="group cursor-pointer rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">{getTaskTypeIcon(task)}</div>
                    <Badge variant="outline" className="text-xs">
                      {getTaskTypeLabel(task)}
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(task)
                      }}
                      className="rounded-lg border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(task.id)
                      }}
                      className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-2 font-semibold text-foreground line-clamp-1">{task.name}</h3>

                {task.description && (
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Importancia</span>
                      <span className="font-semibold text-primary">{task.importance}/10</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${task.importance * 10}%` }}
                      />
                    </div>
                  </div>
                  {!task.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Inactiva
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        open={isFormOpen}
        onOpenChange={handleFormClose}
        editingTask={editingTask}
        onSuccess={() => {
          refetch()
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

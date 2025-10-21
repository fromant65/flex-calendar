"use client";

import { api } from "~/trpc/react";
import { toast } from "sonner"
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import { TaskCard } from "~/components/task-manager/task-card";
import { HelpTip } from "~/components/ui/help-tip";
import { ConfirmActionDialog } from "~/components/task-manager/confirm-action-dialog";
import { EditOccurrenceDialog } from "~/components/task-manager/edit-occurrence-dialog";

export default function TaskManagerPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "complete" | "skip";
    occurrenceId: number;
    taskName: string;
  } | null>(null);
  const [editingOccurrence, setEditingOccurrence] = useState<{
    id: number;
    timeConsumed: number | null;
  } | null>(null);
  
  // Fetch all occurrences with task details
  const { data: occurrences, isLoading, error: occurrencesError } = api.occurrence.getMyOccurrencesWithTask.useQuery()
  
  // Get next occurrence preview for selected task
  const { data: nextOccurrenceDate, error: nextOccurrenceError } = api.task.previewNextOccurrence.useQuery(
    { id: selectedTaskId! },
    { enabled: !!selectedTaskId }
  )

  // Show error toasts for queries
  useEffect(() => {
    if (occurrencesError) {
      toast.error("Error al cargar ocurrencias", { 
        description: occurrencesError.message || "No se pudieron cargar las ocurrencias" 
      })
      console.error("Error fetching occurrences:", occurrencesError)
    }
    if (nextOccurrenceError) {
      toast.error("Error al obtener próxima ocurrencia", { 
        description: nextOccurrenceError.message || "No se pudo obtener la próxima ocurrencia" 
      })
      console.error("Error fetching next occurrence preview:", nextOccurrenceError)
    }
  }, [occurrencesError, nextOccurrenceError])
  
  // Mutations
  const utils = api.useUtils();
  const completeOccurrence = api.occurrence.complete.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.success("Ocurrencia completada", { description: "La ocurrencia fue marcada como completada" })
    },
    onError: (error) => {
      toast.error("Error al completar ocurrencia", { description: error.message || "No se pudo completar la ocurrencia" })
      console.error("Error completing occurrence:", error)
    }
  });
  
  const skipOccurrence = api.occurrence.skip.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
      toast.info("Ocurrencia saltada", { description: "La ocurrencia fue marcada como saltada" })
    },
    onError: (error) => {
      toast.error("Error al saltar ocurrencia", { description: error.message || "No se pudo saltar la ocurrencia" })
      console.error("Error skipping occurrence:", error)
    }
  });

  const updateOccurrence = api.occurrence.update.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setEditingOccurrence(null);
      toast.success("Ocurrencia actualizada", { description: "Los cambios se guardaron correctamente" })
    },
    onError: (error) => {
      toast.error("Error al actualizar ocurrencia", { description: error.message || "No se pudo actualizar la ocurrencia" })
      console.error("Error updating occurrence:", error)
    }
  });

  // Handlers
  const handleConfirmAction = (type: "complete" | "skip", occurrenceId: number) => {
    if (type === "complete") {
      completeOccurrence.mutate({ id: occurrenceId });
    } else {
      skipOccurrence.mutate({ id: occurrenceId });
    }
  };

  const handleSaveOccurrence = (id: number, timeConsumed: number | null) => {
    updateOccurrence.mutate({
      id,
      data: { timeConsumed: timeConsumed ?? undefined },
    });
  };
  
  // Group occurrences by task (filter out inactive tasks)
  const groupedOccurrences = useMemo(() => {
    if (!occurrences) return new Map();
    
    const grouped = new Map<number, typeof occurrences>();
    
    occurrences.forEach((occ) => {
      // Skip inactive tasks
      if (!occ.task.isActive) return;
      
      const taskId = occ.task.id;
      if (!grouped.has(taskId)) {
        grouped.set(taskId, []);
      }
      grouped.get(taskId)!.push(occ);
    });
    
    // Sort occurrences within each task by startDate
    grouped.forEach((occs) => {
      occs.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });
    
    return grouped;
  }, [occurrences]);
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!occurrences || groupedOccurrences.size === 0) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">Gestor de Ocurrencias</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona y completa las ocurrencias de tus tareas
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="container mx-auto px-4 lg:px-6 py-8 flex-1">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">No hay ocurrencias para mostrar</p>
              <p className="text-sm text-muted-foreground">Crea una tarea para comenzar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestor de Ocurrencias</h1>
              <p className="text-sm text-muted-foreground mt-1">Gestiona y completa las ocurrencias de tus tareas</p>
            </div>
            <HelpTip title="Cómo usar el gestor">
              En esta página verás las ocurrencias agrupadas por tarea. Expande una tarjeta para editar, completar o saltar ocurrencias. Usa los diálogos para confirmar acciones.
            </HelpTip>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-6 py-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {Array.from(groupedOccurrences.entries()).map(([taskId, taskOccurrences]) => {
            const task = taskOccurrences[0]!.task;
            const taskType = task.taskType as TaskType;
            const isExpanded = selectedTaskId === taskId;

            return (
              <TaskCard
                key={taskId}
                task={task}
                taskType={taskType}
                occurrences={taskOccurrences}
                isExpanded={isExpanded}
                nextOccurrenceDate={isExpanded ? nextOccurrenceDate : null}
                onToggle={() => setSelectedTaskId(isExpanded ? null : taskId)}
                onEditOccurrence={(id, timeConsumed) =>
                  setEditingOccurrence({ id, timeConsumed })
                }
                onCompleteOccurrence={(id, taskName) =>
                  setConfirmAction({ type: "complete", occurrenceId: id, taskName })
                }
                onSkipOccurrence={(id, taskName) =>
                  setConfirmAction({ type: "skip", occurrenceId: id, taskName })
                }
                isCompleting={completeOccurrence.isPending}
                isSkipping={skipOccurrence.isPending}
              />
            );
          })}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmActionDialog
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
        isLoading={completeOccurrence.isPending || skipOccurrence.isPending}
      />

      <EditOccurrenceDialog
        occurrence={editingOccurrence}
        onSave={handleSaveOccurrence}
        onCancel={() => setEditingOccurrence(null)}
        isLoading={updateOccurrence.isPending}
      />
    </div>
  );
}

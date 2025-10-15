"use client";

import { api } from "~/trpc/react";
import { useState, useMemo } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import { TaskCard } from "~/components/task-manager/task-card";
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
  const { data: occurrences, isLoading } = api.occurrence.getMyOccurrencesWithTask.useQuery();
  
  // Get next occurrence preview for selected task
  const { data: nextOccurrenceDate } = api.task.previewNextOccurrence.useQuery(
    { id: selectedTaskId! },
    { enabled: !!selectedTaskId }
  );
  
  // Mutations
  const utils = api.useUtils();
  const completeOccurrence = api.occurrence.complete.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
    },
  });
  
  const skipOccurrence = api.occurrence.skip.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setConfirmAction(null);
    },
  });

  const updateOccurrence = api.occurrence.update.useMutation({
    onSuccess: () => {
      void utils.occurrence.getMyOccurrencesWithTask.invalidate();
      setEditingOccurrence(null);
    },
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
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!occurrences || groupedOccurrences.size === 0) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="mb-6 text-3xl font-bold">Gestor de Ocurrencias</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="text-lg text-gray-600 dark:text-gray-400">No hay ocurrencias para mostrar</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Crea una tarea para comenzar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">Gestor de Ocurrencias</h1>

      <div className="space-y-6">
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

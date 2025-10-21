"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Circle, Clock, TrendingUp, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import { OccurrenceCard } from "./occurrence-card";
import { BacklogAlert } from "./backlog-alert";
import { api } from "~/trpc/react";

interface TaskCardProps {
  task: any;
  taskType: TaskType;
  occurrences: any[];
  isExpanded: boolean;
  nextOccurrenceDate: Date | null | undefined;
  onToggle: () => void;
  onEditOccurrence: (id: number, timeConsumed: number | null) => void;
  onCompleteOccurrence: (id: number, taskName: string) => void;
  onSkipOccurrence: (id: number, taskName: string) => void;
  onSkipBacklog: (taskId: number) => void;
  isCompleting?: boolean;
  isSkipping?: boolean;
  isSkippingBacklog?: boolean;
}

// Helper to format dates
const formatDate = (date: Date | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Helper to get task type color
const getTaskTypeColor = (taskType: TaskType) => {
  const colors: Record<TaskType, string> = {
    Única: "bg-gray-500 dark:bg-gray-600",
    "Recurrente Finita": "bg-blue-500 dark:bg-blue-600",
    Hábito: "bg-green-500 dark:bg-green-600",
    "Hábito +": "bg-purple-500 dark:bg-purple-600",
    "Fija Única": "bg-orange-500 dark:bg-orange-600",
    "Fija Repetitiva": "bg-red-500 dark:bg-red-600",
  };
  return colors[taskType] ?? "bg-gray-500 dark:bg-gray-600";
};

export function TaskCard({
  task,
  taskType,
  occurrences,
  isExpanded,
  nextOccurrenceDate,
  onToggle,
  onEditOccurrence,
  onCompleteOccurrence,
  onSkipOccurrence,
  onSkipBacklog,
  isCompleting = false,
  isSkipping = false,
  isSkippingBacklog = false,
}: TaskCardProps) {
  // Detect backlog when expanded
  const { data: backlogInfo } = api.occurrence.detectBacklog.useQuery(
    { taskId: task.id },
    { enabled: isExpanded }
  );
  const activeOccurrences = occurrences.filter(
    (o: any) => o.status === "Pending" || o.status === "In Progress"
  );
  const completedOccurrences = occurrences.filter((o: any) => o.status === "Completed");
  const totalTimeConsumed = occurrences.reduce(
    (sum: number, o: any) => sum + (o.timeConsumed ?? 0),
    0
  );

  // Filter occurrences to show: only active, not completed or skipped
  const visibleOccurrences = occurrences.filter(
    (o: any) => o.status !== "Completed" && o.status !== "Skipped"
  );

  return (
    <div className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg overflow-hidden">
      <div
        className="cursor-pointer p-5 transition-colors hover:bg-accent/20"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* Expand/collapse indicator */}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              
              <h3 className="flex-1 text-lg font-semibold text-foreground">{task.name}</h3>
              <Badge className={`${getTaskTypeColor(taskType)} text-white flex-shrink-0`}>
                {taskType}
              </Badge>
            </div>
            {task.description && (
              <p className="mt-2 ml-6 text-sm text-muted-foreground">{task.description}</p>
            )}

            <div className="mt-3 ml-6 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Importancia: {task.importance}/10</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Circle className="h-3.5 w-3.5 text-yellow-500" />
                <span>Activas: {activeOccurrences.length}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>Completadas: {completedOccurrences.length}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Tiempo total: {totalTimeConsumed.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-5">
          <div className="space-y-4">
            {/* Backlog Alert */}
            {backlogInfo?.hasSevereBacklog && backlogInfo.oldestPendingDate && (
              <BacklogAlert
                taskId={task.id}
                taskName={task.name}
                pendingCount={backlogInfo.pendingCount}
                oldestPendingDate={backlogInfo.oldestPendingDate}
                onSkipBacklog={() => onSkipBacklog(task.id)}
                isLoading={isSkippingBacklog}
              />
            )}

            {/* Next occurrence preview */}
            {nextOccurrenceDate && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3.5 mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      Próxima ocurrencia:
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground sm:ml-0">
                    {formatDate(nextOccurrenceDate)}
                  </span>
                </div>
              </div>
            )}

            {/* Occurrences list */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-sm text-foreground">
                Ocurrencias Activas ({visibleOccurrences.length})
                {completedOccurrences.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    • {completedOccurrences.length} completada{completedOccurrences.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              {visibleOccurrences.length > 0 ? (
                visibleOccurrences.map((occurrence: any) => (
                  <OccurrenceCard
                    key={occurrence.id}
                    occurrence={occurrence}
                    taskName={task.name}
                    taskImportance={task.importance}
                    onEdit={onEditOccurrence}
                    onComplete={onCompleteOccurrence}
                    onSkip={onSkipOccurrence}
                    isCompleting={isCompleting}
                    isSkipping={isSkipping}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Todas las ocurrencias han sido completadas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Circle, Clock, TrendingUp, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import { OccurrenceCard } from "./occurrence-card";

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
  isCompleting?: boolean;
  isSkipping?: boolean;
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
  isCompleting = false,
  isSkipping = false,
}: TaskCardProps) {
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
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* Expand/collapse indicator */}
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              
              <CardTitle className="flex-1">{task.name}</CardTitle>
              <Badge className={`${getTaskTypeColor(taskType)} text-white flex-shrink-0`}>
                {taskType}
              </Badge>
            </div>
            {task.description && (
              <CardDescription className="mt-2 ml-2 sm:ml-7">{task.description}</CardDescription>
            )}

            <div className="mt-4 ml-2 flex flex-wrap gap-4 text-sm sm:ml-7">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span>Importancia: {task.importance}/10</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                <span>Activas: {activeOccurrences.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>Completadas: {completedOccurrences.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                <span>Tiempo total: {totalTimeConsumed.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t bg-gray-50 dark:bg-gray-900 pt-4">
          <div className="space-y-4">
            {/* Next occurrence preview */}
            {nextOccurrenceDate && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Próxima ocurrencia al completar la actual:
                    </span>
                  </div>
                  <span className="text-blue-700 dark:text-blue-300 sm:ml-0">
                    {formatDate(nextOccurrenceDate)}
                  </span>
                </div>
              </div>
            )}

            {/* Occurrences list */}
            <div className="space-y-3">
              <h3 className="font-semibold">
                Ocurrencias Activas ({visibleOccurrences.length})
                {completedOccurrences.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
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
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 dark:text-green-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Todas las ocurrencias han sido completadas
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

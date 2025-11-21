"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Circle, Clock, TrendingUp, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskType } from "~/server/api/services/types";
import type { TaskOccurrence } from "~/types";
import { OccurrenceCard } from "./occurrence-card";
import { BacklogAlert } from "./backlog-alert";
import { CompletionStreakBadge } from "./completion-streak-badge";
import { api } from "~/trpc/react";
import { formatDateShort } from "~/lib/date-display-utils";

interface TaskCardProps {
  task: any;
  taskType: TaskType;
  occurrences: TaskOccurrence[];
  isExpanded: boolean;
  nextOccurrenceDate: Date | null | undefined;
  onToggle: () => void;
  onEditOccurrence: (id: number, timeConsumed: number | null, targetTimeConsumption: number | null, targetDate: Date | null, limitDate: Date | null) => void;
  onCompleteOccurrence: (id: number, taskName: string) => void;
  onSkipOccurrence: (id: number, taskName: string) => void;
  onSkipBacklog: (taskId: number) => void;
  isCompleting?: boolean;
  isSkipping?: boolean;
  isSkippingBacklog?: boolean;
}

// Helper to format dates using the proper display utility
const formatDate = (date: Date | null | undefined) => {
  if (!date) return "N/A";
  return formatDateShort(date);
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
  const [showCompletedSkipped, setShowCompletedSkipped] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  
  // Detect backlog when expanded
  const { data: backlogInfo } = api.occurrence.detectBacklog.useQuery(
    { taskId: task.id },
    { enabled: isExpanded }
  );
  const activeOccurrences = occurrences.filter(
    (o) => o.status === "Pending" || o.status === "In Progress"
  );
  const completedOccurrences = occurrences.filter((o) => o.status === "Completed");
  const skippedOccurrences = occurrences.filter((o) => o.status === "Skipped");
  
  // Sort completed/skipped by completedAt date (newest first)
  const sortedCompletedSkipped = [...completedOccurrences, ...skippedOccurrences].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });
  
  // Limit to 5 initially, show all if requested
  const INITIAL_DISPLAY_COUNT = 5;
  const displayedCompletedSkipped = showAllCompleted 
    ? sortedCompletedSkipped 
    : sortedCompletedSkipped.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreCompleted = sortedCompletedSkipped.length > INITIAL_DISPLAY_COUNT;
  
  const totalTimeConsumed = occurrences.reduce(
    (sum, o) => sum + (o.timeConsumed ?? 0),
    0
  );

  // Filter occurrences to show: only active, not completed or skipped
  const visibleOccurrences = occurrences.filter(
    (o) => o.status !== "Completed" && o.status !== "Skipped"
  );

  return (
    <motion.div 
      className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="cursor-pointer p-5 transition-colors hover:bg-accent/20"
        onClick={onToggle}
        whileTap={{ scale: 0.995 }}
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

            {/* Completion Streak Badge - Only show for tasks with multiple occurrences */}
            <div className="mt-3 ml-6">
              <CompletionStreakBadge taskId={task.id} />
            </div>

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
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="border-t border-border bg-muted/20 p-5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="space-y-4">
            {/* Backlog Alert */}
            <AnimatePresence>
              {backlogInfo?.hasSevereBacklog && backlogInfo.oldestPendingDate && (
                <motion.div
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <BacklogAlert
                    taskId={task.id}
                    taskName={task.name}
                    pendingCount={backlogInfo.pendingCount}
                    oldestPendingDate={backlogInfo.oldestPendingDate}
                    overdueCount={backlogInfo.overdueCount}
                    estimatedMissingCount={backlogInfo.estimatedMissingCount}
                    onSkipBacklog={() => onSkipBacklog(task.id)}
                    isLoading={isSkippingBacklog}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next occurrence preview */}
            <AnimatePresence>
              {nextOccurrenceDate && (
                <motion.div 
                  className="rounded-lg bg-primary/10 border border-primary/20 p-3.5 overflow-hidden"
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
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
              </motion.div>
            )}
            </AnimatePresence>

            {/* Occurrences list */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-sm text-foreground">
                Ocurrencias Activas ({visibleOccurrences.length})
                {sortedCompletedSkipped.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    • {completedOccurrences.length} completada{completedOccurrences.length !== 1 ? "s" : ""}
                    {skippedOccurrences.length > 0 && `, ${skippedOccurrences.length} saltada${skippedOccurrences.length !== 1 ? "s" : ""}`}
                  </span>
                )}
              </h3>
              {visibleOccurrences.length > 0 ? (
                visibleOccurrences.map((occurrence) => (
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

              {/* Toggle for completed/skipped occurrences */}
              {sortedCompletedSkipped.length > 0 && (
                <div className="pt-2">
                  <motion.button
                    onClick={() => {
                      setShowCompletedSkipped(!showCompletedSkipped);
                      if (showCompletedSkipped) {
                        setShowAllCompleted(false); // Reset when hiding
                      }
                    }}
                    className="text-xs text-primary hover:underline focus:outline-none w-full text-left cursor-pointer"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showCompletedSkipped ? "Ocultar" : "Mostrar"} ocurrencias completadas/saltadas ({sortedCompletedSkipped.length})
                  </motion.button>
                  
                  <AnimatePresence>
                    {showCompletedSkipped && (
                      <motion.div 
                        className="mt-2.5 space-y-2.5 overflow-hidden"
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                      {displayedCompletedSkipped.map((occurrence) => (
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
                      ))}
                      
                      {/* Show "Ver más" button if there are more than 5 */}
                      {hasMoreCompleted && !showAllCompleted && (
                        <motion.button
                          onClick={() => setShowAllCompleted(true)}
                          className="w-full rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          Ver más ({sortedCompletedSkipped.length - INITIAL_DISPLAY_COUNT} restantes)
                        </motion.button>
                      )}
                      
                      {/* Show "Ver menos" button when showing all */}
                      {hasMoreCompleted && showAllCompleted && (
                        <motion.button
                          onClick={() => setShowAllCompleted(false)}
                          className="w-full rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-muted-foreground/50"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          Ver menos
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

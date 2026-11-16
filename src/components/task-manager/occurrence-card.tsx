import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, Edit, AlertCircle, SkipForward } from "lucide-react";
import HelpTip from "~/components/ui/help-tip"
import { formatDateLong, getLimitDateDisplay as getLimit, formatCompletedDateTime } from "~/lib/date-display-utils";

type TaskManagerOccurrenceLike = {
  id: number
  status: string
  completedAt?: Date | null
  slotStartAt?: Date | null
  dueAt?: Date | null
  tentativeAt?: Date | null
  targetTimeMinutes?: number | null
  timeSpentMinutes?: number | null
}

interface OccurrenceCardProps {
  occurrence: TaskManagerOccurrenceLike;
  taskName: string;
  taskImportance: number;
  onEdit: (id: number, timeConsumed: number | null, targetTimeConsumption: number | null, targetDate: Date | null, limitDate: Date | null) => void;
  onComplete: (id: number, taskName: string) => void;
  onSkip: (id: number, taskName: string) => void;
  isCompleting?: boolean;
  isSkipping?: boolean;
}

// Helper to get status badge
const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase().replace(/\s+/g, "_")

  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: { color: "bg-yellow-500 dark:bg-yellow-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    in_progress: { color: "bg-blue-500 dark:bg-blue-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    completed: { color: "bg-green-500 dark:bg-green-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    skipped: { color: "bg-gray-500 dark:bg-gray-600", icon: <CheckCircle2 className="h-3 w-3" /> },
  };
  const variant = variants[normalized];

  if (!variant) {
    return (
      <Badge className="bg-gray-500 dark:bg-gray-600 text-white flex items-center gap-1">
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={`${variant.color} text-white flex items-center gap-1`}>
      {variant.icon}
      {status}
    </Badge>
  );
};

export function OccurrenceCard({
  occurrence,
  taskName,
  taskImportance,
  onEdit,
  onComplete,
  onSkip,
  isCompleting = false,
  isSkipping = false,
}: OccurrenceCardProps) {
  const normalizedStatus = occurrence.status.toLowerCase().replace(/\s+/g, "_")
  const limitDate = occurrence.dueAt ?? null
  const startDate = occurrence.slotStartAt ?? null
  const targetDate = occurrence.tentativeAt ?? null
  const targetTime = occurrence.targetTimeMinutes ?? null
  const timeSpent = occurrence.timeSpentMinutes ?? null
  const limitDateDisplay = getLimit(limitDate as Date | null);
  const isActive = normalizedStatus !== "completed" && normalizedStatus !== "skipped";

  // Create badge component from the badge text
  const limitBadge = limitDateDisplay.badgeText ? (
    limitDateDisplay.badgeText === "Vencida" ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {limitDateDisplay.badgeText}
      </Badge>
    ) : (
      <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
        {limitDateDisplay.badgeText}
      </Badge>
    )
  ) : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3.5 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2.5">
          {/* Status and limit date badges */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(occurrence.status)}
              {limitBadge}
            </div>
            <HelpTip title="Acciones sobre ocurrencia">
              Editar: cambiar horas dedicadas. <br />
              Saltar: marcar la ocurrencia como no realizada. <br />
              Completar: marcar como hecha y registrar tiempo dedicado.
            </HelpTip>
          </div>

          {/* Occurrence details - reorganized in semantic order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {/* Row 1: Dates */}
            <div>
              <span className="font-medium text-muted-foreground">Inicio: </span>
            <span className="text-foreground">{startDate ? formatDateLong(startDate) : "N/A"}</span>
            </div>
            {targetDate && (
              <div>
                <span className="font-medium text-muted-foreground">Fecha meta: </span>
                <span className="text-foreground">{formatDateLong(targetDate)}</span>
              </div>
            )}
              
            {/* Row 2: Limit date and importance */}
            {limitDate && (
              <div>
                <span className="font-medium text-muted-foreground">Fecha límite: </span>
                <span className="font-semibold text-foreground">{formatDateLong(limitDate)}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Importancia: </span>
              <span className="font-semibold text-foreground">{taskImportance}/10</span>
            </div>

            {/* Row 3: Time metrics */}
            <div>
              <span className="font-medium text-muted-foreground">Tiempo dedicado: </span>
                <span className="font-semibold text-foreground">{timeSpent != null ? timeSpent.toFixed(1) + ' hs' : '—'}</span>
              {targetTime && (
                <span className="text-muted-foreground">
                  {" / "}{targetTime} min
                </span>
              )}
            </div>

            {/* Row 4: Completion date (if completed) */}
            {normalizedStatus === "completed" && occurrence.completedAt && (
              <div className="md:col-span-2">
                <span className="font-medium text-muted-foreground">Completada el: </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCompletedDateTime(occurrence.completedAt)}
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer flex-1 sm:flex-none"
              onClick={() => onEdit(occurrence.id, timeSpent, targetTime, targetDate, limitDate)}
            >
              <Edit className="mr-1 h-3.5 w-3.5" />
              Editar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer flex-1 sm:flex-none"
              onClick={() => onSkip(occurrence.id, taskName)}
              disabled={isSkipping}
            >
              <SkipForward className="mr-1 h-3.5 w-3.5" />
              Saltar
            </Button>
            <Button
              size="sm"
              variant="default"
              className="cursor-pointer flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              onClick={() => onComplete(occurrence.id, taskName)}
              disabled={isCompleting}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Completar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

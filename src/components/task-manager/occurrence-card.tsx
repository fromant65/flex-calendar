import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, Edit, AlertCircle, SkipForward } from "lucide-react";
import HelpTip from "~/components/ui/help-tip"
import { formatDateLong, getLimitDateDisplay as getLimit } from "~/lib/date-display-utils";
import type { TaskOccurrence } from "~/types";

interface OccurrenceCardProps {
  occurrence: TaskOccurrence;
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
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    Pending: { color: "bg-yellow-500 dark:bg-yellow-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    "In Progress": { color: "bg-blue-500 dark:bg-blue-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    Completed: { color: "bg-green-500 dark:bg-green-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    Skipped: { color: "bg-gray-500 dark:bg-gray-600", icon: <CheckCircle2 className="h-3 w-3" /> },
  };
  const variant = variants[status];

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
  const limitDateDisplay = getLimit(occurrence.limitDate);
  const isActive = occurrence.status !== "Completed" && occurrence.status !== "Skipped";

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
            <span className="text-foreground">{occurrence.startDate ? formatDateLong(occurrence.startDate) : "N/A"}</span>
            </div>
            {occurrence.targetDate && (
              <div>
                <span className="font-medium text-muted-foreground">Fecha meta: </span>
                <span className="text-foreground">{formatDateLong(occurrence.targetDate)}</span>
              </div>
            )}
              
            {/* Row 2: Limit date and importance */}
            {occurrence.limitDate && (
              <div>
                <span className="font-medium text-muted-foreground">Fecha límite: </span>
                <span className="font-semibold text-foreground">{formatDateLong(occurrence.limitDate)}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Importancia: </span>
              <span className="font-semibold text-foreground">{taskImportance}/10</span>
            </div>

            {/* Row 3: Time metrics */}
            <div>
              <span className="font-medium text-muted-foreground">Tiempo dedicado: </span>
                <span className="font-semibold text-foreground">{occurrence.timeConsumed != null ? occurrence.timeConsumed.toFixed(1) + ' hs' : '—'}</span>
              {occurrence.targetTimeConsumption && (
                <span className="text-muted-foreground">
                  {" / "}{occurrence.targetTimeConsumption}h
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer flex-1 sm:flex-none"
              onClick={() => onEdit(occurrence.id, occurrence.timeConsumed, occurrence.targetTimeConsumption, occurrence.targetDate, occurrence.limitDate)}
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

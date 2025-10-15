import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, Edit, AlertCircle } from "lucide-react";

interface OccurrenceCardProps {
  occurrence: any;
  taskName: string;
  taskImportance: number;
  onEdit: (id: number, timeConsumed: number | null) => void;
  onComplete: (id: number, taskName: string) => void;
  onSkip: (id: number, taskName: string) => void;
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

// Helper to format urgency (0-10 scale)
const getUrgencyDisplay = (urgency: number | null) => {
  if (urgency === null || urgency === 0) {
    return { text: "Baja", color: "text-green-600 dark:text-green-400", badge: null };
  }

  if (urgency <= 5) {
    return {
      text: `${urgency.toFixed(1)}/10`,
      color: "text-green-600 dark:text-green-400",
      badge: null,
    };
  } else if (urgency <= 9) {
    return {
      text: `${urgency.toFixed(1)}/10`,
      color: "text-orange-600 dark:text-orange-400",
      badge: (
        <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
          Bastante urgente
        </Badge>
      ),
    };
  } else {
    return {
      text: `${urgency.toFixed(1)}/10`,
      color: "text-red-600 dark:text-red-400 font-semibold",
      badge: (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Muy urgente
        </Badge>
      ),
    };
  }
};

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
  const urgencyDisplay = getUrgencyDisplay(occurrence.urgency);
  const isActive = occurrence.status !== "Completed" && occurrence.status !== "Skipped";

  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Status and urgency badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(occurrence.status)}
              {urgencyDisplay.badge}
            </div>

            {/* Occurrence details - reorganized in semantic order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {/* Row 1: Dates */}
              <div>
                <span className="font-medium text-muted-foreground">Inicio: </span>
                <span>{formatDate(occurrence.startDate)}</span>
              </div>
              {occurrence.targetDate && (
                <div>
                  <span className="font-medium text-muted-foreground">Fecha meta: </span>
                  <span>{formatDate(occurrence.targetDate)}</span>
                </div>
              )}

              {/* Row 2: Limit date and importance */}
              {occurrence.limitDate && (
                <div>
                  <span className="font-medium text-muted-foreground">Fecha límite: </span>
                  <span className="font-medium">{formatDate(occurrence.limitDate)}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-muted-foreground">Importancia: </span>
                <span className="font-semibold">{taskImportance}/10</span>
              </div>

              {/* Row 3: Time metrics */}
              <div>
                <span className="font-medium text-muted-foreground">Tiempo dedicado: </span>
                <span className="font-semibold">
                  {occurrence.timeConsumed?.toFixed(1) ?? 0}h
                </span>
                {occurrence.targetTimeConsumption && (
                  <span className="text-muted-foreground">
                    {" / "}{occurrence.targetTimeConsumption}h
                  </span>
                )}
              </div>
              {occurrence.targetTimeConsumption && (
                <div>
                  <span className="font-medium text-muted-foreground">Tiempo esperado: </span>
                  <span>{occurrence.targetTimeConsumption}h</span>
                </div>
              )}

              {/* Row 4: Urgency */}
              {occurrence.urgency !== null && (
                <div>
                  <span className="font-medium text-muted-foreground">Urgencia: </span>
                  <span className={urgencyDisplay.color}>{urgencyDisplay.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isActive && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(occurrence.id, occurrence.timeConsumed)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => onComplete(occurrence.id, taskName)}
                disabled={isCompleting}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Completar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSkip(occurrence.id, taskName)}
                disabled={isSkipping}
              >
                Saltar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

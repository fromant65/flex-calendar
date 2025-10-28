"use client"

import { Badge } from "~/components/ui/badge";
import { Flame, CheckCircle2 } from "lucide-react";
import { api } from "~/trpc/react";

interface CompletionStreakBadgeProps {
  taskId: number;
}

export function CompletionStreakBadge({ taskId }: CompletionStreakBadgeProps) {
  const { data: streakInfo } = api.occurrence.getTaskStreak.useQuery({ taskId });

  if (!streakInfo || streakInfo.totalOccurrences <= 1) {
    return null; // Only show for tasks with multiple occurrences
  }

  const { currentStreak, totalCompleted, totalOccurrences, completionRate } = streakInfo;
  const ratePercent = completionRate.toFixed(0);

  return (
    <div className="flex items-center gap-2">
      {/* Streak Badge */}
      {currentStreak > 0 && (
        <Badge 
          variant="secondary" 
          className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Flame className="h-3 w-3 mr-1" />
          <span className="text-xs font-semibold">{currentStreak} seguida{currentStreak !== 1 ? "s" : ""}</span>
        </Badge>
      )}

      {/* Completion Ratio Badge */}
      <Badge 
        variant="outline" 
        className="border-primary/30 text-primary hover:bg-primary/10 transition-colors"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        <span className="text-xs font-semibold">{totalCompleted}/{totalOccurrences} ({ratePercent}%)</span>
      </Badge>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date };
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onReset: () => void;
}

export function DateRangePicker({
  dateRange,
  onFromDateChange,
  onToDateChange,
  onReset,
}: DateRangePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return (
      dateRange.from.getTime() === firstDay.getTime() &&
      dateRange.to.getTime() === lastDay.getTime()
    );
  };

  const hasCustomRange = !isCurrentMonth();

  return (
    <div className="space-y-3">
      {/* Compact Filter Toggle Button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={hasCustomRange ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 h-9"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Período:</span>
          <span className="text-xs font-medium">
            {format(dateRange.from, "dd MMM", { locale: es })} - {format(dateRange.to, "dd MMM", { locale: es })}
          </span>
          {hasCustomRange && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">
              1
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </Button>

        {hasCustomRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReset();
              setIsExpanded(false);
            }}
            className="h-9 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            <span className="text-xs hidden sm:inline">Resetear</span>
          </Button>
        )}
      </div>

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Desde:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 justify-start text-left font-normal h-9",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    <span className="text-xs">
                      {dateRange.from ? format(dateRange.from, "dd MMM yyyy", { locale: es }) : "Fecha inicio"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date: Date | undefined) => date && onFromDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Hasta:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 justify-start text-left font-normal h-9",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    <span className="text-xs">
                      {dateRange.to ? format(dateRange.to, "dd MMM yyyy", { locale: es }) : "Fecha fin"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date: Date | undefined) => date && onToDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                onReset();
                setIsExpanded(false);
              }}
              className="h-9 whitespace-nowrap"
            >
              Este mes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client"

import { motion } from "framer-motion"
import type { EventWithDetails } from "~/types"
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "~/lib/utils"

interface EventsListProps {
  events: EventWithDetails[]
  title: string
  emptyMessage?: string
  onEventClick?: (event: EventWithDetails) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export function EventsList({ events, title, emptyMessage = "No hay eventos", onEventClick }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-2.5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {events.map((event, index) => {
        const task = event.occurrence?.task
        const startTime = new Date(event.start)
        const endTime = new Date(event.finish)
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // hours
        const isCompleted = event.isCompleted
        const isPast = endTime < new Date()

        return (
          <motion.div
            key={event.id}
            onClick={() => onEventClick?.(event)}
            className={cn(
              "group cursor-pointer rounded-lg border border-border bg-card/50 p-3.5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md",
              isCompleted && "opacity-60 hover:opacity-80",
              isPast && !isCompleted && "border-orange-500/30"
            )}
            variants={itemVariants}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                {/* Task name and status */}
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : isPast ? (
                    <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-primary" />
                  )}
                  <h3 className={cn(
                    "font-semibold text-sm text-foreground line-clamp-1",
                    isCompleted && "line-through"
                  )}>
                    {task?.name || event.context || "Evento"}
                  </h3>
                </div>

                {/* Description */}
                {task?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 pl-5">
                    {task.description}
                  </p>
                )}

                {/* Time and duration */}
                <div className="flex flex-wrap items-center gap-2.5 pl-5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {startTime.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {endTime.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{duration.toFixed(1)}h</span>
                  
                  {isCompleted && event.dedicatedTime && (
                    <>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="text-green-600 dark:text-green-400">
                        {event.dedicatedTime.toFixed(1)}h dedicadas
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Event type indicator */}
              {event.isFixed && (
                <div className="flex-shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Fijo
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

interface DayWeekEventsProps {
  todayEvents: EventWithDetails[]
  weekEvents: EventWithDetails[]
  onEventClick?: (event: EventWithDetails) => void
}

export function DayWeekEvents({ todayEvents, weekEvents, onEventClick }: DayWeekEventsProps) {
  const [activeTab, setActiveTab] = React.useState<"day" | "week">("day")

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("day")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer rounded-t-md",
            activeTab === "day"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          Hoy ({todayEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer rounded-t-md",
            activeTab === "week"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          Esta Semana ({weekEvents.length})
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "day" ? (
          <EventsList
            events={todayEvents}
            title="Eventos de Hoy"
            emptyMessage="No hay eventos para hoy"
            onEventClick={onEventClick}
          />
        ) : (
          <EventsList
            events={weekEvents}
            title="Eventos de la Semana"
            emptyMessage="No hay eventos esta semana"
            onEventClick={onEventClick}
          />
        )}
      </motion.div>
    </div>
  )
}

// Need to import React for useState
import React from "react"

"use client"

import type React from "react"

import type { OccurrenceWithTask, QuadrantPosition } from "~/types"
import { calculateQuadrant, getQuadrantLabel } from "~/lib/eisenhower-utils"
import { getTaskTypeClassName } from "~/lib/task-type-colors"
import { Clock, Flag, ArrowUpDown, Check, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu"

interface EisenhowerMatrixProps {
    occurrences: OccurrenceWithTask[]
    onTaskSelect: (occurrence: OccurrenceWithTask) => void
    onTaskDragStart: (occurrence: OccurrenceWithTask) => void
    onTaskClick: (occurrence: OccurrenceWithTask) => void
    selectedTaskId?: number
}

export function EisenhowerMatrix({
    occurrences,
    onTaskSelect,
    onTaskDragStart,
    onTaskClick,
    selectedTaskId,
}: EisenhowerMatrixProps) {
    const quadrants = useMemo(() => {
        const grouped: Record<QuadrantPosition["quadrant"], OccurrenceWithTask[]> = {
            "urgent-important": [] as OccurrenceWithTask[],
            "not-urgent-important": [] as OccurrenceWithTask[],
            "urgent-not-important": [] as OccurrenceWithTask[],
            "not-urgent-not-important": [] as OccurrenceWithTask[],
        }

        occurrences.forEach((occurrence) => {
            const quadrant = calculateQuadrant(occurrence).quadrant as keyof typeof grouped
            grouped[quadrant].push(occurrence)
        })

        return grouped
    }, [occurrences])

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Task Matrix</h2>
                <p className="text-sm text-muted-foreground">Eisenhower Priority System</p>
            </div>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-border p-px overflow-hidden">
                {/* Top Left: Not Urgent but Important */}
                <QuadrantPanel
                    title={getQuadrantLabel("not-urgent-important")}
                    subtitle="Important, Not Urgent"
                    tasks={quadrants["not-urgent-important"]}
                    quadrant="not-urgent-important"
                    onTaskSelect={onTaskSelect}
                    onTaskDragStart={onTaskDragStart}
                    onTaskClick={onTaskClick}
                    selectedTaskId={selectedTaskId}
                />

                {/* Top Right: Urgent and Important */}
                <QuadrantPanel
                    title={getQuadrantLabel("urgent-important")}
                    subtitle="Important & Urgent"
                    tasks={quadrants["urgent-important"]}
                    quadrant="urgent-important"
                    onTaskSelect={onTaskSelect}
                    onTaskDragStart={onTaskDragStart}
                    onTaskClick={onTaskClick}
                    selectedTaskId={selectedTaskId}
                />

                {/* Bottom Left: Not Urgent, Not Important */}
                <QuadrantPanel
                    title={getQuadrantLabel("not-urgent-not-important")}
                    subtitle="Not Important, Not Urgent"
                    tasks={quadrants["not-urgent-not-important"]}
                    quadrant="not-urgent-not-important"
                    onTaskSelect={onTaskSelect}
                    onTaskDragStart={onTaskDragStart}
                    onTaskClick={onTaskClick}
                    selectedTaskId={selectedTaskId}
                />

                {/* Bottom Right: Urgent but Not Important */}
                <QuadrantPanel
                    title={getQuadrantLabel("urgent-not-important")}
                    subtitle="Not Important, Urgent"
                    tasks={quadrants["urgent-not-important"]}
                    quadrant="urgent-not-important"
                    onTaskSelect={onTaskSelect}
                    onTaskDragStart={onTaskDragStart}
                    onTaskClick={onTaskClick}
                    selectedTaskId={selectedTaskId}
                />
            </div>
        </div>
    )
}

interface QuadrantPanelProps {
    title: string
    subtitle: string
    tasks: OccurrenceWithTask[]
    quadrant: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
    onTaskSelect: (occurrence: OccurrenceWithTask) => void
    onTaskDragStart: (occurrence: OccurrenceWithTask) => void
    onTaskClick: (occurrence: OccurrenceWithTask) => void
    selectedTaskId?: number
}

type SortOption = "importance" | "urgency" | "duration"
type SortOrder = "asc" | "desc"

function QuadrantPanel({
    title,
    subtitle,
    tasks,
    quadrant,
    onTaskSelect,
    onTaskDragStart,
    onTaskClick,
    selectedTaskId,
}: QuadrantPanelProps) {
    const [sortBy, setSortBy] = useState<SortOption>("importance")
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

    const sortedTasks = useMemo(() => {
        const tasksCopy = [...tasks]

        const compareFn = (a: OccurrenceWithTask, b: OccurrenceWithTask) => {
            let valueA = 0
            let valueB = 0

            switch (sortBy) {
                case "importance":
                    valueA = a.task?.importance ?? 0
                    valueB = b.task?.importance ?? 0
                    break
                case "urgency":
                    valueA = a.urgency ?? 0
                    valueB = b.urgency ?? 0
                    break
                case "duration":
                    valueA = a.targetTimeConsumption ?? 0
                    valueB = b.targetTimeConsumption ?? 0
                    break
            }

            return sortOrder === "desc" ? valueB - valueA : valueA - valueB
        }

        return tasksCopy.sort(compareFn)
    }, [tasks, sortBy, sortOrder])

    return (
        <div className="bg-card flex flex-col min-h-0">
            <div className="p-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ArrowUpDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSortBy("importance")}>
                                {sortBy === "importance" && <Check className="h-4 w-4 mr-2" />}
                                {sortBy !== "importance" && <span className="w-4 mr-2" />}
                                Importance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("urgency")}>
                                {sortBy === "urgency" && <Check className="h-4 w-4 mr-2" />}
                                {sortBy !== "urgency" && <span className="w-4 mr-2" />}
                                Urgency
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("duration")}>
                                {sortBy === "duration" && <Check className="h-4 w-4 mr-2" />}
                                {sortBy !== "duration" && <span className="w-4 mr-2" />}
                                Duration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                                {sortOrder === "desc" && <Check className="h-4 w-4 mr-2" />}
                                {sortOrder !== "desc" && <span className="w-4 mr-2" />}
                                <ArrowDownWideNarrow className="h-4 w-4 mr-2" />
                                High to Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                                {sortOrder === "asc" && <Check className="h-4 w-4 mr-2" />}
                                {sortOrder !== "asc" && <span className="w-4 mr-2" />}
                                <ArrowUpNarrowWide className="h-4 w-4 mr-2" />
                                Low to High
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 scrollbar-themed">
                {sortedTasks.map((occurrence) => (
                    <TaskCard
                        key={occurrence.id}
                        occurrence={occurrence}
                        quadrant={quadrant}
                        onSelect={onTaskSelect}
                        onDragStart={onTaskDragStart}
                        onClick={onTaskClick}
                        isSelected={selectedTaskId === occurrence.id}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">No tasks</div>
                )}
            </div>
        </div>
    )
}

interface TaskCardProps {
    occurrence: OccurrenceWithTask
    quadrant: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
    onSelect: (occurrence: OccurrenceWithTask) => void
    onDragStart: (occurrence: OccurrenceWithTask) => void
    onClick: (occurrence: OccurrenceWithTask) => void
    isSelected: boolean
}

function TaskCard({ occurrence, quadrant, onSelect, onDragStart, onClick, isSelected }: TaskCardProps) {
    const taskTypeClassName = getTaskTypeClassName(occurrence.task?.taskType, {
        includeHover: true,
        includeRing: true,
        isSelected,
    })

    const handleClick = (e: React.MouseEvent) => {
        if (e.detail === 1) {
            // Single click - select for scheduling
            onSelect(occurrence)
        } else if (e.detail === 2) {
            // Double click - show details
            onClick(occurrence)
        }
    }

    return (
        <div
            draggable
            onDragStart={() => onDragStart(occurrence)}
            onClick={handleClick}
            className={`p-3 rounded-lg border cursor-move transition-all hover:scale-[1.02] ${taskTypeClassName}`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-2">{occurrence.task?.name}</h4>
                <div className="flex items-center gap-1 shrink-0">
                    <Flag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{occurrence.task?.importance}</span>
                </div>
            </div>
            {occurrence.task?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{occurrence.task.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {occurrence.targetTimeConsumption && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{occurrence.targetTimeConsumption} {occurrence.targetTimeConsumption === 1 ? "h" : "hs"}</span>
                    </div>
                )}
                {typeof (occurrence.urgency) === "number" && (
                    <div className="flex items-center gap-1">
                        <span>Urgency: {occurrence.urgency}/10</span>
                    </div>
                )}
            </div>
        </div>
    )
}

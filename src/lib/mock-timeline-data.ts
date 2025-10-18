import type { TaskWithRecurrence, OccurrenceWithTask, EventWithDetails } from "~/types"

// Mock data generator for timeline
export interface TimelineData {
  tasks: TaskWithRecurrence[]
  occurrences: OccurrenceWithTask[]
  events: EventWithDetails[]
}

// Helper to generate dates
const generateDateRange = (startDate: Date, days: number): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }
  return dates
}

// Generate mock tasks with more variety
const mockTasks: TaskWithRecurrence[] = [
  {
    id: 1,
    ownerId: "user1",
    name: "Complete Project Proposal",
    description: "Write and submit the Q1 project proposal",
    recurrenceId: null,
    importance: 8,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
    taskType: "Única",
  },
  {
    id: 2,
    ownerId: "user1",
    name: "Daily Exercise",
    description: "30 minutes of cardio",
    recurrenceId: 1,
    importance: 7,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
    recurrence: {
      id: 1,
      creationDate: new Date("2025-01-01"),
      interval: 1,
      daysOfWeek: ["Mon", "Wed", "Fri"],
      daysOfMonth: null,
      maxOccurrences: null,
      completedOccurrences: 50,
      lastPeriodStart: new Date("2025-01-13"),
      endDate: null,
    },
    taskType: "Hábito",
  },
  {
    id: 3,
    ownerId: "user1",
    name: "Team Meeting Preparation",
    description: "Prepare slides and agenda",
    recurrenceId: null,
    importance: 6,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: new Date("2025-01-17"),
    createdAt: new Date("2025-01-10"),
    updatedAt: null,
    taskType: "Única",
  },
  {
    id: 4,
    ownerId: "user1",
    name: "Code Review",
    description: "Review pull requests",
    recurrenceId: 2,
    importance: 9,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: null,
    createdAt: new Date("2025-01-05"),
    updatedAt: null,
    recurrence: {
      id: 2,
      creationDate: new Date("2025-01-05"),
      interval: 2,
      daysOfWeek: ["Tue", "Thu"],
      daysOfMonth: null,
      maxOccurrences: 100,
      completedOccurrences: 30,
      lastPeriodStart: new Date("2025-01-14"),
      endDate: new Date("2025-12-31"),
    },
    taskType: "Recurrente Finita",
  },
  {
    id: 5,
    ownerId: "user1",
    name: "Weekly Report",
    description: "Submit weekly status report",
    recurrenceId: 3,
    importance: 8,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
    recurrence: {
      id: 3,
      creationDate: new Date("2025-01-01"),
      interval: 7,
      daysOfWeek: ["Fri"],
      daysOfMonth: null,
      maxOccurrences: null,
      completedOccurrences: 15,
      lastPeriodStart: new Date("2025-01-10"),
      endDate: null,
    },
    taskType: "Hábito",
  },
  {
    id: 6,
    ownerId: "user1",
    name: "Monthly Planning",
    description: "Plan goals and tasks for the month",
    recurrenceId: 4,
    importance: 9,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    completedAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
    recurrence: {
      id: 4,
      creationDate: new Date("2025-01-01"),
      interval: 30,
      daysOfWeek: null,
      daysOfMonth: [1],
      maxOccurrences: null,
      completedOccurrences: 4,
      lastPeriodStart: new Date("2025-01-01"),
      endDate: null,
    },
    taskType: "Hábito",
  },
]

// Dynamic occurrence generator
const generateOccurrences = (): OccurrenceWithTask[] => {
  const occurrences: OccurrenceWithTask[] = []
  let occId = 1

  // Generate occurrences for the year 2025
  const yearStart = new Date("2025-01-01")
  const yearEnd = new Date("2025-12-31")
  const allDates = generateDateRange(yearStart, 365)

  mockTasks.forEach((task) => {
    if (task.recurrence && task.recurrence.daysOfWeek) {
      // Weekly recurring tasks
      const dayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
      }
      
      allDates.forEach((date) => {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        if (task.recurrence?.daysOfWeek?.includes(dayOfWeek as any)) {
          // Randomly skip some occurrences (10% chance)
          const shouldSkip = Math.random() < 0.1
          
          occurrences.push({
            id: occId++,
            associatedTaskId: task.id,
            startDate: new Date(date),
            limitDate: null,
            targetDate: new Date(date),
            targetTimeConsumption: 30,
            timeConsumed: shouldSkip ? 0 : Math.floor(Math.random() * 45) + 15,
            status: shouldSkip ? "Skipped" : "Completed",
            urgency: task.importance - Math.floor(Math.random() * 3),
            completedAt: shouldSkip ? null : new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000),
            createdAt: new Date(date),
            updatedAt: new Date(date),
            task: task,
          })
        }
      })
    } else if (task.recurrence && task.recurrence.daysOfMonth) {
      // Monthly recurring tasks
      for (let month = 0; month < 12; month++) {
        const date = new Date(2025, month, task.recurrence.daysOfMonth[0]!)
        // Randomly skip some monthly tasks (5% chance)
        const shouldSkip = Math.random() < 0.05
        
        occurrences.push({
          id: occId++,
          associatedTaskId: task.id,
          startDate: date,
          limitDate: null,
          targetDate: date,
          targetTimeConsumption: 120,
          timeConsumed: shouldSkip ? 0 : Math.floor(Math.random() * 150) + 60,
          status: shouldSkip ? "Skipped" : "Completed",
          urgency: task.importance,
          completedAt: shouldSkip ? null : new Date(date.getTime() + Math.random() * 6 * 60 * 60 * 1000),
          createdAt: date,
          updatedAt: date,
          task: task,
        })
      }
    } else {
      // One-time tasks
      const startDate = new Date(task.createdAt)
      occurrences.push({
        id: occId++,
        associatedTaskId: task.id,
        startDate: startDate,
        limitDate: task.completedAt ? new Date(task.completedAt) : null,
        targetDate: startDate,
        targetTimeConsumption: 240,
        timeConsumed: Math.floor(Math.random() * 300) + 120,
        status: "Completed",
        urgency: task.importance,
        completedAt: task.completedAt || new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdAt: startDate,
        updatedAt: task.completedAt || null,
        task: task,
      })
    }
  })

  return occurrences
}

// Dynamic event generator
const generateEvents = (occurrences: OccurrenceWithTask[]): EventWithDetails[] => {
  const events: EventWithDetails[] = []
  let eventId = 1

  occurrences.forEach((occ) => {
    const numEvents = Math.floor(Math.random() * 3) + 1 // 1-3 events per occurrence
    const occStart = new Date(occ.startDate)
    const occEnd = occ.completedAt ? new Date(occ.completedAt) : new Date(occStart.getTime() + 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < numEvents; i++) {
      const eventStart = new Date(occStart.getTime() + Math.random() * (occEnd.getTime() - occStart.getTime()))
      const duration = Math.floor(Math.random() * 120) + 15 // 15-135 minutes
      const eventEnd = new Date(eventStart.getTime() + duration * 60 * 1000)

      events.push({
        id: eventId++,
        context: `Session ${i + 1}`,
        ownerId: "user1",
        associatedOccurrenceId: occ.id,
        isFixed: false,
        start: eventStart,
        finish: eventEnd,
        isCompleted: true,
        dedicatedTime: duration,
        completedAt: eventEnd,
        createdAt: eventStart,
        updatedAt: eventEnd,
        occurrence: occ,
      })
    }
  })

  return events
}

// Generate all mock data
const allMockOccurrences = generateOccurrences()
const allMockEvents = generateEvents(allMockOccurrences)

// Mock tRPC-style API
export const mockTimelineApi = {
  getTimelineData: (startDate: Date, endDate: Date): TimelineData => {
    console.log("[Mock API] Fetching timeline data from", startDate, "to", endDate)

    // Filter occurrences within date range
    const filteredOccurrences = allMockOccurrences.filter((occ) => {
      const occStart = new Date(occ.startDate)
      const occEnd = occ.completedAt ? new Date(occ.completedAt) : occStart
      return occStart <= endDate && occEnd >= startDate
    })

    // Get unique task IDs
    const taskIds = new Set(filteredOccurrences.map((occ) => occ.associatedTaskId))
    const filteredTasks = mockTasks.filter((task) => taskIds.has(task.id))

    // Filter events
    const occurrenceIds = new Set(filteredOccurrences.map((occ) => occ.id))
    const filteredEvents = allMockEvents.filter(
      (event) => event.associatedOccurrenceId && occurrenceIds.has(event.associatedOccurrenceId),
    )

    console.log("[Mock API] Returning:", {
      tasks: filteredTasks.length,
      occurrences: filteredOccurrences.length,
      events: filteredEvents.length,
    })

    return {
      tasks: filteredTasks,
      occurrences: filteredOccurrences,
      events: filteredEvents,
    }
  },
}

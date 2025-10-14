import type { CalendarEvent, EventWithDetails, OccurrenceWithTask, Task, TaskOccurrence } from "~/types"

// Mock data
const mockTasks: Task[] = [
  {
    id: 1,
    ownerId: "user1",
    name: "Complete project proposal",
    description: "Finish the Q1 project proposal document",
    recurrenceId: null,
    importance: 9,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
  },
  {
    id: 2,
    ownerId: "user1",
    name: "Review team code",
    description: "Code review for the new feature branch",
    recurrenceId: null,
    importance: 7,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-02"),
    updatedAt: null,
  },
  {
    id: 3,
    ownerId: "user1",
    name: "Update documentation",
    description: "Update API documentation",
    recurrenceId: null,
    importance: 5,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-03"),
    updatedAt: null,
  },
  {
    id: 4,
    ownerId: "user1",
    name: "Team meeting",
    description: "Weekly team sync",
    recurrenceId: 1,
    importance: 6,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-04"),
    updatedAt: null,
  },
  {
    id: 5,
    ownerId: "user1",
    name: "Email responses",
    description: "Respond to pending emails",
    recurrenceId: null,
    importance: 3,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-05"),
    updatedAt: null,
  },
  {
    id: 6,
    ownerId: "user1",
    name: "Client presentation",
    description: "Present new features to client",
    recurrenceId: null,
    importance: 10,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-06"),
    updatedAt: null,
  },
  {
    id: 7,
    ownerId: "user1",
    name: "Social media check",
    description: "Check social media updates",
    recurrenceId: null,
    importance: 2,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-07"),
    updatedAt: null,
  },
  {
    id: 8,
    ownerId: "user1",
    name: "Database optimization",
    description: "Optimize database queries",
    recurrenceId: null,
    importance: 8,
    isActive: true,
    isFixed: false,
    fixedStartTime: null,
    fixedEndTime: null,
    createdAt: new Date("2025-01-08"),
    updatedAt: null,
  },
]

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const nextWeek = new Date(today)
nextWeek.setDate(nextWeek.getDate() + 7)

const mockOccurrences: TaskOccurrence[] = [
  {
    id: 1,
    associatedTaskId: 1,
    startDate: today,
    limitDate: tomorrow,
    targetDate: today,
    targetTimeConsumption: 120,
    timeConsumed: 0,
    status: "Pending",
    urgency: 9,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 2,
    associatedTaskId: 2,
    startDate: today,
    limitDate: tomorrow,
    targetDate: today,
    targetTimeConsumption: 60,
    timeConsumed: 0,
    status: "Pending",
    urgency: 8,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 3,
    associatedTaskId: 3,
    startDate: today,
    limitDate: nextWeek,
    targetDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    targetTimeConsumption: 90,
    timeConsumed: 0,
    status: "Pending",
    urgency: 4,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 4,
    associatedTaskId: 4,
    startDate: today,
    limitDate: today,
    targetDate: today,
    targetTimeConsumption: 30,
    timeConsumed: 0,
    status: "Pending",
    urgency: 7,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 5,
    associatedTaskId: 5,
    startDate: today,
    limitDate: tomorrow,
    targetDate: today,
    targetTimeConsumption: 45,
    timeConsumed: 0,
    status: "Pending",
    urgency: 6,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 6,
    associatedTaskId: 6,
    startDate: today,
    limitDate: tomorrow,
    targetDate: tomorrow,
    targetTimeConsumption: 90,
    timeConsumed: 0,
    status: "Pending",
    urgency: 10,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 7,
    associatedTaskId: 7,
    startDate: today,
    limitDate: nextWeek,
    targetDate: null,
    targetTimeConsumption: 15,
    timeConsumed: 0,
    status: "Pending",
    urgency: 2,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 8,
    associatedTaskId: 8,
    startDate: today,
    limitDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    targetDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    targetTimeConsumption: 180,
    timeConsumed: 0,
    status: "Pending",
    urgency: 5,
    createdAt: today,
    updatedAt: null,
  },
]

// Stateful mock data that can be updated
const mockEventsState: CalendarEvent[] = [
  {
    id: 1,
    context: "Morning focus time",
    ownerId: "user1",
    associatedOccurrenceId: 4,
    isFixed: true,
    start: new Date(today.setHours(10, 0, 0, 0)),
    finish: new Date(today.setHours(10, 30, 0, 0)),
    isCompleted: false,
    dedicatedTime: 30,
    createdAt: today,
    updatedAt: null,
  },
  {
    id: 2,
    context: "Afternoon work session",
    ownerId: "user1",
    associatedOccurrenceId: 2,
    isFixed: false,
    start: new Date(today.setHours(14, 0, 0, 0)),
    finish: new Date(today.setHours(15, 0, 0, 0)),
    isCompleted: false,
    dedicatedTime: 60,
    createdAt: today,
    updatedAt: null,
  },
]

let nextEventId = 3

// Callback system for state updates
type UpdateCallback = () => void
const updateCallbacks: UpdateCallback[] = []

export function subscribeToUpdates(callback: UpdateCallback) {
  updateCallbacks.push(callback)
  return () => {
    const index = updateCallbacks.indexOf(callback)
    if (index > -1) updateCallbacks.splice(index, 1)
  }
}

function notifyUpdates() {
  updateCallbacks.forEach((cb) => cb())
}

// Mock tRPC client
export const mockTrpc = {
  calendarEvent: {
    getMyEventsWithDetails: {
      useQuery: () => {
        const eventsWithDetails: EventWithDetails[] = mockEventsState.map((event) => {
          const occurrence = mockOccurrences.find((o) => o.id === event.associatedOccurrenceId)
          const task = occurrence ? mockTasks.find((t) => t.id === occurrence.associatedTaskId) : undefined
          
          const occurrenceWithTask: OccurrenceWithTask | undefined = occurrence && task 
            ? { ...occurrence, task } 
            : undefined

          return {
            ...event,
            occurrence: occurrenceWithTask,
          }
        })
        return { data: eventsWithDetails, isLoading: false }
      },
    },
    create: {
      useMutation: () => ({
        mutate: (data: { associatedOccurrenceId: number; isFixed: boolean; start: Date; finish: Date }) => {
          console.log("[v0] Creating calendar event:", data)
          const newEvent: CalendarEvent = {
            id: nextEventId++,
            context: "New event",
            ownerId: "user1",
            associatedOccurrenceId: data.associatedOccurrenceId,
            isFixed: data.isFixed,
            start: data.start,
            finish: data.finish,
            isCompleted: false,
            dedicatedTime: Math.round((data.finish.getTime() - data.start.getTime()) / (1000 * 60)),
            createdAt: new Date(),
            updatedAt: null,
          }
          mockEventsState.push(newEvent)
          notifyUpdates()
        },
      }),
    },
    update: {
      useMutation: () => ({
        mutate: (data: { id: number; start?: Date; finish?: Date; isFixed?: boolean }) => {
          console.log("[v0] Updating calendar event:", data)
          const event = mockEventsState.find((e) => e.id === data.id)
          if (event) {
            if (data.start) event.start = data.start
            if (data.finish) event.finish = data.finish
            if (data.isFixed !== undefined) event.isFixed = data.isFixed
            event.updatedAt = new Date()
            if (data.start && data.finish) {
              event.dedicatedTime = Math.round((data.finish.getTime() - data.start.getTime()) / (1000 * 60))
            }
            notifyUpdates()
          }
        },
      }),
    },
    delete: {
      useMutation: () => ({
        mutate: (data: { id: number }) => {
          console.log("[v0] Deleting calendar event:", data)
          const index = mockEventsState.findIndex((e) => e.id === data.id)
          if (index > -1) {
            mockEventsState.splice(index, 1)
            notifyUpdates()
          }
        },
      }),
    },
  },
  occurrence: {
    getByDateRange: {
      useQuery: () => {
        const occurrencesWithTask: OccurrenceWithTask[] = mockOccurrences.map((occurrence) => {
          const task = mockTasks.find((t) => t.id === occurrence.associatedTaskId)!
          return {
            ...occurrence,
            task,
          }
        })
        return { data: occurrencesWithTask, isLoading: false }
      },
    },
    update: {
      useMutation: () => ({
        mutate: (data: any) => {
          console.log("[v0] Updating occurrence:", data)
        },
      }),
    },
  },
}

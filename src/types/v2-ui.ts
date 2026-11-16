import type {
  EventGetMyEventsWithDetailsItem,
  EventGetTodayEventsItem,
  EventGetWeekEventsItem,
  OccurrenceGetByDateRangeItem,
  TaskGetByImportanceItem,
  TaskGetByUrgencyItem,
} from "~/server/api/routers/derived-endpoint-types"

export type CalendarOccurrenceLike =
  | OccurrenceGetByDateRangeItem
  | TaskGetByUrgencyItem
  | TaskGetByImportanceItem
  | NonNullable<EventGetMyEventsWithDetailsItem["occurrence"]>
  | NonNullable<EventGetTodayEventsItem["occurrence"]>
  | NonNullable<EventGetWeekEventsItem["occurrence"]>

export type CalendarEventLike =
  | EventGetMyEventsWithDetailsItem
  | EventGetTodayEventsItem
  | EventGetWeekEventsItem

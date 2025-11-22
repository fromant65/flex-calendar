/**
 * Shared mocks for TaskSchedulerService tests
 * These mocks should be imported before the actual service
 */

// Mock database
jest.mock('~/server/db', () => ({
  db: {},
}));

// Mock adapters
jest.mock('../../adapter', () => ({
  TaskAdapter: jest.fn().mockImplementation(() => ({
    getTaskWithRecurrence: jest.fn(),
    updateTask: jest.fn(),
    completeTask: jest.fn(),
    deleteTask: jest.fn(),
    getTasksByOwner: jest.fn(),
    getTasksWithRecurrenceByOwnerId: jest.fn(),
    getNextOccurrence: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    getActiveTasksByOwnerId: jest.fn(),
  })),
  OccurrenceAdapter: jest.fn().mockImplementation(() => ({
    getLatestOccurrenceByTaskId: jest.fn(),
    createOccurrence: jest.fn(),
    getOccurrencesByTaskId: jest.fn(),
    getOccurrenceWithTask: jest.fn(),
    getOccurrenceById: jest.fn(),
    updateOccurrence: jest.fn(),
    completeOccurrence: jest.fn(),
    skipOccurrence: jest.fn(),
    getCompletedOccurrencesByOwnerAndDateRange: jest.fn(),
    getOccurrencesByOwner: jest.fn(),
    getOccurrencesByDateRange: jest.fn(),
    getOccurrencesWithTaskByUserId: jest.fn(),
  })),
  CalendarEventAdapter: jest.fn().mockImplementation(() => ({
    createEvent: jest.fn(),
    getEventById: jest.fn(),
    getEventsByOwnerId: jest.fn(),
    getEventsByOccurrenceId: jest.fn(),
    getEventWithDetails: jest.fn(),
    updateEvent: jest.fn(),
    completeEvent: jest.fn(),
    deleteEvent: jest.fn(),
    syncOccurrenceTimeFromEvents: jest.fn(),
    getCompletedEventsByOccurrenceIds: jest.fn(),
    getEventsWithDetailsByDateRange: jest.fn(),
  })),
  RecurrenceAdapter: jest.fn().mockImplementation(() => ({
    getRecurrenceById: jest.fn(),
    updateRecurrence: jest.fn(),
    incrementCompletedOccurrences: jest.fn(),
    resetCompletedOccurrences: jest.fn(),
  })),
  AdminAdapter: jest.fn().mockImplementation(() => ({
    getGlobalStats: jest.fn(),
    getUsersWithActivity: jest.fn(),
    getUserStats: jest.fn(),
    getAllUsers: jest.fn(),
    getUserCounts: jest.fn(),
    getAllUsersWithStats: jest.fn(),
  })),
  NotificationsAdapter: jest.fn().mockImplementation(() => ({
    createNotification: jest.fn(),
    updateNotification: jest.fn(),
    deleteNotification: jest.fn(),
    getAllNotifications: jest.fn(),
    getActiveNotifications: jest.fn(),
    toggleNotificationStatus: jest.fn(),
    getNotificationsForUser: jest.fn(),
    getUnreadNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAsUnread: jest.fn(),
    getNotificationById: jest.fn(),
    getUnreadCount: jest.fn(),
  })),
}));

// Mock repositories
jest.mock('../../repository', () => ({
  TaskRecurrenceRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    updateById: jest.fn(),
  })),
}));

// Mock services
jest.mock('../analytics/task-analytics.service', () => ({
  TaskAnalyticsService: jest.fn().mockImplementation(() => ({
    enrichOccurrenceWithUrgency: jest.fn((occ) => occ),
  })),
}));

export {}; // Make this a module

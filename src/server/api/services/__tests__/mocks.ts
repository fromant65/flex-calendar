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
  })),
  OccurrenceAdapter: jest.fn().mockImplementation(() => ({
    getLatestOccurrenceByTaskId: jest.fn(),
    createOccurrence: jest.fn(),
    getOccurrencesByTaskId: jest.fn(),
  })),
  CalendarEventAdapter: jest.fn().mockImplementation(() => ({})),
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
  TaskAnalyticsService: jest.fn().mockImplementation(() => ({})),
}));

export {}; // Make this a module

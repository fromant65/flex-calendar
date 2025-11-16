import '../mocks';
import { EventManagementService } from '../../events/event-management.service';
import { CalendarEventAdapter } from '../../../adapter';
import type { CalendarEvent, EventWithDetails } from '~/types';
import { makeEventWithDetails } from '../fixtures';

describe('EventManagementService (skeleton)', () => {
  let service: EventManagementService;
  let mockEventAdapter: jest.Mocked<CalendarEventAdapter>;

  beforeEach(() => {
    service = new EventManagementService();
    mockEventAdapter = (service as any).eventAdapter as jest.Mocked<CalendarEventAdapter>;
    jest.clearAllMocks();
  });

  it('should fetch events by date range using adapter (mocked)', async () => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sample = makeEventWithDetails({ id: 1, ownerId: 'u1', start, finish: end });

    mockEventAdapter.getEventsWithDetailsByDateRange.mockResolvedValue([sample] as any);

    const events = await service.getCalendarEventsWithDetailsByDateRange('u1', start, end);
    expect(events).toEqual([sample]);
  });

  it('should create calendar event via adapter and return created event', async () => {
    const data = {
      context: 'meeting',
      associatedOccurrenceId: null,
      isFixed: false,
      start: new Date('2025-11-16T09:00:00Z'),
      finish: new Date('2025-11-16T10:00:00Z'),
    } as const;

    const created: CalendarEvent = {
      id: 100,
      context: data.context,
      ownerId: 'u-x',
      associatedOccurrenceId: data.associatedOccurrenceId ?? null,
      isFixed: data.isFixed,
      start: data.start,
      finish: data.finish,
      isCompleted: false,
      dedicatedTime: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockEventAdapter.createEvent.mockResolvedValue(created);

    const result = await service.createCalendarEvent('u-x', data as any);
    expect(result).toEqual(created);
    expect(mockEventAdapter.createEvent).toHaveBeenCalledWith('u-x', expect.objectContaining({ start: data.start }));
  });

  it('should update a calendar event via adapter', async () => {
    const updateData = { context: 'updated' };
    const updatedEvent: CalendarEvent = {
      id: 12,
      context: 'updated',
      ownerId: 'u1',
      associatedOccurrenceId: null,
      isFixed: false,
      start: new Date(),
      finish: new Date(),
      isCompleted: false,
      dedicatedTime: 0,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockEventAdapter.updateEvent.mockResolvedValue(updatedEvent);

    const result = await service.updateCalendarEvent(12, updateData as any);
    expect(result).toEqual(updatedEvent);
    expect(mockEventAdapter.updateEvent).toHaveBeenCalledWith(12, updateData);
  });

  it('should not allow deleting events tied to fixed tasks', async () => {
    const event: CalendarEvent = {
      id: 13,
      context: 'fixed-event',
      ownerId: 'u1',
      associatedOccurrenceId: null,
      isFixed: true,
      start: new Date(),
      finish: new Date(),
      isCompleted: false,
      dedicatedTime: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockEventAdapter.getEventById.mockResolvedValue(event);
    mockEventAdapter.deleteEvent.mockResolvedValue(false);

    await expect(service.deleteCalendarEvent(13)).rejects.toThrow("Cannot delete events from fixed tasks. Use skip or complete instead.");
  });

  it('should delete event and sync occurrence when associated occurrence exists', async () => {
    const event: CalendarEvent = {
      id: 14,
      context: 'assoc-event',
      ownerId: 'u1',
      associatedOccurrenceId: 88,
      isFixed: false,
      start: new Date(),
      finish: new Date(),
      isCompleted: false,
      dedicatedTime: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockEventAdapter.getEventById.mockResolvedValue(event);
    mockEventAdapter.deleteEvent.mockResolvedValue(true);

    const deleted = await service.deleteCalendarEvent(event.id);
    expect(deleted).toBe(true);
    expect(mockEventAdapter.syncOccurrenceTimeFromEvents).toHaveBeenCalledWith(88);
  });
});

/**
 * Ownership Validation Helper
 * 
 * Provides utilities to validate that resources belong to the requesting user
 */

import { TRPCError } from "@trpc/server";
import { TaskRepository, TaskOccurrenceRepository, CalendarEventRepository } from "../repository";

/**
 * Verify that a task belongs to the specified user
 * @throws TRPCError with FORBIDDEN code if task doesn't belong to user
 */
export async function verifyTaskOwnership(taskId: number, userId: string): Promise<void> {
  const taskRepo = new TaskRepository();
  const task = await taskRepo.findById(taskId);
  
  if (!task) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Task not found" 
    });
  }
  
  if (task.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this task" 
    });
  }
}

/**
 * Verify that an occurrence belongs to the specified user (through its associated task)
 * @throws TRPCError with FORBIDDEN code if occurrence doesn't belong to user
 */
export async function verifyOccurrenceOwnership(occurrenceId: number, userId: string): Promise<void> {
  const occurrenceRepo = new TaskOccurrenceRepository();
  const occurrence = await occurrenceRepo.findWithTask(occurrenceId);
  
  if (!occurrence) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Occurrence not found" 
    });
  }
  
  if (occurrence.task?.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this occurrence" 
    });
  }
}

/**
 * Verify that a calendar event belongs to the specified user
 * @throws TRPCError with FORBIDDEN code if event doesn't belong to user
 */
export async function verifyCalendarEventOwnership(eventId: number, userId: string): Promise<void> {
  const eventRepo = new CalendarEventRepository();
  const event = await eventRepo.findById(eventId);
  
  if (!event) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Calendar event not found" 
    });
  }
  
  if (event.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this calendar event" 
    });
  }
}

/**
 * Get task and verify ownership in one call
 * @returns The task if it exists and belongs to the user
 * @throws TRPCError if not found or forbidden
 */
export async function getTaskWithOwnership(taskId: number, userId: string) {
  const taskRepo = new TaskRepository();
  const task = await taskRepo.findById(taskId);
  
  if (!task) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Task not found" 
    });
  }
  
  if (task.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this task" 
    });
  }
  
  return task;
}

/**
 * Get occurrence and verify ownership in one call
 * @returns The occurrence with task if it exists and belongs to the user
 * @throws TRPCError if not found or forbidden
 */
export async function getOccurrenceWithOwnership(occurrenceId: number, userId: string) {
  const occurrenceRepo = new TaskOccurrenceRepository();
  const occurrence = await occurrenceRepo.findWithTask(occurrenceId);
  
  if (!occurrence) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Occurrence not found" 
    });
  }
  
  if (occurrence.task?.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this occurrence" 
    });
  }
  
  return occurrence;
}

/**
 * Get calendar event and verify ownership in one call
 * @returns The event if it exists and belongs to the user
 * @throws TRPCError if not found or forbidden
 */
export async function getCalendarEventWithOwnership(eventId: number, userId: string) {
  const eventRepo = new CalendarEventRepository();
  const event = await eventRepo.findById(eventId);
  
  if (!event) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Calendar event not found" 
    });
  }
  
  if (event.ownerId !== userId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You don't have permission to access this calendar event" 
    });
  }
  
  return event;
}

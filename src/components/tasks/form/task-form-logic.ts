/**
 * Task Form Logic - Helper functions for task form
 */

import type { TaskWithRecurrence } from "~/types"
import type { FormTaskType } from "./task-type-selector"

/**
 * Determines the form task type from a task object
 */
export function getTaskTypeFromTask(task: TaskWithRecurrence): FormTaskType {
  // Check for fixed tasks first
  if (task.isFixed) {
    if (task.recurrence?.maxOccurrences === 1) {
      return "fixed-unique"
    }
    return "fixed-repetitive"
  }
  
  // Check for habit tasks (has interval and lastPeriodStart)
  if (task.recurrence?.interval && task.recurrence?.lastPeriodStart) {
    // Habit+ has interval + lastPeriodStart + (daysOfWeek OR daysOfMonth)
    if (task.recurrence.daysOfWeek?.length || task.recurrence.daysOfMonth?.length) {
      return "habit-plus"
    }
    // Regular habit only has interval + lastPeriodStart
    return "habit"
  }
  
  // Check for finite recurrence (has pattern but no interval/lastPeriodStart)
  if ((task.recurrence?.daysOfWeek?.length || task.recurrence?.daysOfMonth?.length) && 
      !task.recurrence?.lastPeriodStart) {
    return "finite"
  }
  
  // Default to unique
  return "unique"
}

/**
 * Extract dates from a task for populating the form
 */
export function extractDatesFromTask(task: TaskWithRecurrence & { nextOccurrence?: any }) {
  let extractedTargetDate: string | undefined = undefined;
  let extractedLimitDate: string | undefined = undefined;
  let extractedFixedDate: string | undefined = undefined;
  
  // Check if nextOccurrence exists
  if ('nextOccurrence' in task && task.nextOccurrence) {
    const occurrence = task.nextOccurrence;
    
    if (task.isFixed) {
      // For fixed tasks, extract the date from targetDate (start datetime)
      if (occurrence.targetDate) {
        extractedFixedDate = new Date(occurrence.targetDate).toISOString().split("T")[0];
      }
    } else {
      // For non-fixed tasks, extract target and limit dates
      if (occurrence.targetDate) {
        extractedTargetDate = new Date(occurrence.targetDate).toISOString().split("T")[0];
      }
      if (occurrence.limitDate) {
        extractedLimitDate = new Date(occurrence.limitDate).toISOString().split("T")[0];
      }
    }
  } else {
    // Fallback: if no nextOccurrence, use today's date for fixed unique tasks
    if (task.isFixed) {
      extractedFixedDate = new Date().toISOString().split("T")[0];
    }
  }
  
  return { extractedTargetDate, extractedLimitDate, extractedFixedDate };
}

/**
 * Validates fixed task data before submission
 */
export function validateFixedTask(
  taskType: FormTaskType,
  formData: {
    fixedStartTime: string;
    fixedEndTime: string;
    fixedDate?: string;
    daysOfWeek: string[];
    daysOfMonth: number[];
    endDate?: string;
  }
): string | null {
  const isFixed = taskType === "fixed-unique" || taskType === "fixed-repetitive";

  if (!isFixed) return null;

  if (!formData.fixedStartTime || !formData.fixedEndTime) {
    return "Las tareas fijas deben tener horario de inicio y fin";
  }
  
  // Validate that end time is after start time
  const [startHour, startMinute] = formData.fixedStartTime.split(":").map(Number);
  const [endHour, endMinute] = formData.fixedEndTime.split(":").map(Number);
  const startMinutes = startHour! * 60 + startMinute!;
  const endMinutes = endHour! * 60 + endMinute!;
  
  if (endMinutes <= startMinutes) {
    return "La hora de finalización debe ser posterior a la hora de inicio";
  }
  
  if (taskType === "fixed-unique" && !formData.fixedDate) {
    return "Las tareas fijas únicas deben tener una fecha definida";
  }
  
  if (taskType === "fixed-repetitive") {
    if (!formData.daysOfWeek.length && !formData.daysOfMonth.length) {
      return "Las tareas fijas repetitivas deben tener días de la semana o del mes definidos";
    }
    if (!formData.endDate) {
      return "Las tareas fijas repetitivas deben tener una fecha de finalización para evitar generar eventos infinitamente";
    }
  }
  
  return null;
}

/**
 * Builds the recurrence object based on task type
 */
export function buildRecurrence(
  taskType: FormTaskType,
  formData: {
    interval: number;
    daysOfWeek: string[];
    daysOfMonth: number[];
    maxOccurrences?: number;
    endDate?: string;
  }
): Record<string, any> | undefined {
  if (taskType === "unique") {
    return {
      maxOccurrences: 1,
    };
  }
  
  if (taskType === "finite") {
    const recurrence: Record<string, any> = {
      maxOccurrences: formData.maxOccurrences,
      endDate: formData.endDate ? new Date(formData.endDate + "T23:59:59") : undefined,
    };
    
    if (formData.daysOfWeek.length > 0) {
      recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
    } else if (formData.daysOfMonth.length > 0) {
      recurrence.daysOfMonth = formData.daysOfMonth;
    }
    
    return recurrence;
  }
  
  if (taskType === "habit") {
    return {
      interval: formData.interval,
      maxOccurrences: 1,
      lastPeriodStart: new Date(),
    };
  }
  
  if (taskType === "habit-plus") {
    const recurrence: Record<string, any> = {
      interval: formData.interval,
      maxOccurrences: formData.maxOccurrences,
      endDate: formData.endDate ? new Date(formData.endDate + "T23:59:59") : undefined,
      lastPeriodStart: new Date(),
    };
    
    if (formData.daysOfWeek.length > 0) {
      recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
    } else if (formData.daysOfMonth.length > 0) {
      recurrence.daysOfMonth = formData.daysOfMonth;
    }
    
    return recurrence;
  }
  
  if (taskType === "fixed-unique") {
    return {
      maxOccurrences: 1,
    };
  }
  
  if (taskType === "fixed-repetitive") {
    const recurrence: Record<string, any> = {
      endDate: new Date(formData.endDate! + "T23:59:59"),
    };
    
    if (formData.daysOfWeek.length > 0) {
      recurrence.daysOfWeek = formData.daysOfWeek as Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
    } else if (formData.daysOfMonth.length > 0) {
      recurrence.daysOfMonth = formData.daysOfMonth;
    }
    
    return recurrence;
  }
  
  return undefined;
}

/**
 * Builds target and limit dates based on task type and form data
 */
export function buildDates(
  taskType: FormTaskType,
  formData: {
    fixedDate?: string;
    fixedStartTime: string;
    fixedEndTime: string;
    targetDate?: string;
    limitDate?: string;
  }
): { targetDate?: Date; limitDate?: Date; error?: string } {
  const isFixed = taskType === "fixed-unique" || taskType === "fixed-repetitive";
  
  let targetDate: Date | undefined;
  let limitDate: Date | undefined;
  
  if (isFixed) {
    let dateStr: string | undefined;
    
    if (taskType === "fixed-unique") {
      dateStr = formData.fixedDate;
    } else if (taskType === "fixed-repetitive") {
      dateStr = new Date().toISOString().split('T')[0];
    }
    
    // Ensure we have all required data for fixed tasks
    if (!dateStr || !formData.fixedStartTime || !formData.fixedEndTime) {
      console.error("Missing fixed task data:", {
        dateStr,
        fixedStartTime: formData.fixedStartTime,
        fixedEndTime: formData.fixedEndTime,
        taskType,
        formData
      });
      return { error: "Error: Faltan datos requeridos para crear la tarea fija" };
    }
    
    targetDate = new Date(dateStr + "T" + formData.fixedStartTime + ":00");
    limitDate = new Date(dateStr + "T" + formData.fixedEndTime + ":00");
    
    // Verify dates were created successfully
    if (isNaN(targetDate.getTime()) || isNaN(limitDate.getTime())) {
      console.error("Invalid dates created:", { targetDate, limitDate, dateStr, formData });
      return { error: "Error: Las fechas creadas son inválidas" };
    }
  } else {
    if (formData.targetDate) {
      targetDate = new Date(formData.targetDate + "T12:00:00");
    }
    
    if (formData.limitDate) {
      limitDate = new Date(formData.limitDate + "T12:00:00");
    }
  }
  
  return { targetDate, limitDate };
}

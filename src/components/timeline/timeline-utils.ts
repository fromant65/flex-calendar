/**
 * Timeline utility functions for overlap detection and level assignment
 */

export interface TimeRange {
  start: Date
  end: Date
}

export interface ItemWithRange<T> {
  item: T
  start: Date
  end: Date
}

/**
 * Check if two time ranges overlap
 */
export const doTimeRangesOverlap = (range1: TimeRange, range2: TimeRange): boolean => {
  return range1.start < range2.end && range2.start < range1.end
}

/**
 * Assign vertical levels to blocks that overlap
 * Each block represents an occurrence with all its events
 */
export const assignBlockLevels = <T>(blocks: Array<{ range: TimeRange; item: T }>): Map<T, number> => {
  const levels = new Map<T, number>()
  const sortedBlocks = [...blocks].sort((a, b) => a.range.start.getTime() - b.range.start.getTime())
  
  sortedBlocks.forEach(({ range, item }) => {
    // Find the first available level (starting from 0)
    let level = 0
    let levelOccupied = true
    
    while (levelOccupied) {
      levelOccupied = false
      
      // Check if any block at this level overlaps with current block
      for (const [otherItem, otherLevel] of levels.entries()) {
        if (otherLevel === level) {
          // Find the other block's range
          const otherBlock = sortedBlocks.find(b => b.item === otherItem)
          if (otherBlock && doTimeRangesOverlap(range, otherBlock.range)) {
            levelOccupied = true
            break
          }
        }
      }
      
      if (levelOccupied) {
        level++
      }
    }
    
    levels.set(item, level)
  })
  
  return levels
}

/**
 * Calculate position and width for timeline items with minimum width for visibility
 */
export const getItemStyle = (
  start: Date,
  end: Date,
  dateRange: Date[],
  verticalOffset: number = 0
): React.CSSProperties => {
  if (dateRange.length === 0) {
    console.warn('getItemStyle: dateRange is empty')
    return { left: "0%", width: "100%" }
  }

  // Ensure we're working with Date objects
  const itemStart = start instanceof Date ? start : new Date(start)
  const itemEnd = end instanceof Date ? end : new Date(end)
  
  const itemStartTime = itemStart.getTime()
  const itemEndTime = itemEnd.getTime()
  
  const rangeStart = dateRange[0]!.getTime()
  const rangeEnd = new Date(dateRange[dateRange.length - 1]!)
  rangeEnd.setHours(23, 59, 59, 999)
  const rangeEndTime = rangeEnd.getTime()
  const totalRange = rangeEndTime - rangeStart
  
  if (totalRange <= 0) {
    console.error('getItemStyle: Invalid time range')
    return { left: "0%", width: "100%" }
  }

  const left = ((itemStartTime - rangeStart) / totalRange) * 100
  const width = ((itemEndTime - itemStartTime) / totalRange) * 100

  // Set minimum width of 1.5% for very short events to make them visible
  const finalWidth = Math.max(width, 1.5)

  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.min(100 - Math.max(0, left), finalWidth)}%`,
    minWidth: "20px",
  }
}

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Format day of week
 */
export const formatDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
}

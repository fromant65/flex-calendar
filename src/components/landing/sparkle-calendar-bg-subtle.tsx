"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useMemo } from "react"

interface CalendarCell {
  id: number
  row: number
  col: number
  isActive: boolean
  color: string
  intensity: number
  nextChangeTime: number
}

interface SparkleCalendarBgProps {
  opacity?: number
}

export function SparkleCalendarBgSubtle({ opacity = 0.15 }: SparkleCalendarBgProps) {
  const [cells, setCells] = useState<CalendarCell[]>([])
  const [dimensions, setDimensions] = useState({ rows: 6, cols: 7 })

  // Memoize colors to avoid recreating on each render
  const colors = useMemo(() => [
    "rgba(34, 197, 94, 0.5)", // green
    "rgba(59, 130, 246, 0.5)", // blue
    "rgba(168, 85, 247, 0.5)", // purple
    "rgba(236, 72, 153, 0.5)", // pink
    "rgba(251, 146, 60, 0.5)", // orange
    "rgba(234, 179, 8, 0.5)", // yellow
    "rgba(99, 102, 241, 0.5)", // indigo
    "rgba(20, 184, 166, 0.5)", // teal
  ], [])

  // Calculate grid dimensions based on viewport
  useEffect(() => {
    const calculateDimensions = () => {
      const isMobile = window.innerWidth < 640
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024
      
      // Adjust rows based on screen size for better performance
      let rows = 6 // Default
      if (isMobile) {
        rows = 4 // Fewer rows on mobile for better performance
      } else if (isTablet) {
        rows = 6
      } else {
        rows = 8 // More rows on desktop to fill the space
      }
      
      setDimensions({ rows, cols: 7 })
    }

    calculateDimensions()
    window.addEventListener('resize', calculateDimensions)
    return () => window.removeEventListener('resize', calculateDimensions)
  }, [])

  useEffect(() => {
    // Initialize cells based on dimensions
    const initialCells: CalendarCell[] = []
    let id = 0
    for (let row = 0; row < dimensions.rows; row++) {
      for (let col = 0; col < dimensions.cols; col++) {
        initialCells.push({
          id: id++,
          row,
          col,
          isActive: Math.random() > 0.6, // Slightly fewer active cells
          color: colors[Math.floor(Math.random() * colors.length)]!,
          intensity: 0.3 + Math.random() * 0.3, // Reduced intensity range
          nextChangeTime: Date.now() + Math.random() * 4000,
        })
      }
    }
    setCells(initialCells)

    // Optimized update interval
    const interval = setInterval(() => {
      setCells((prevCells) => {
        const now = Date.now()
        // Only update cells that need changing
        let hasChanges = false
        const newCells = prevCells.map((cell) => {
          if (now >= cell.nextChangeTime) {
            hasChanges = true
            const willBeActive = Math.random() > 0.55
            return {
              ...cell,
              isActive: willBeActive,
              color: colors[Math.floor(Math.random() * colors.length)]!,
              intensity: 0.3 + Math.random() * 0.3,
              nextChangeTime: now + 3000 + Math.random() * 6000, // 3-9 seconds
            }
          }
          return cell
        })
        return hasChanges ? newCells : prevCells // Only update state if there are actual changes
      })
    }, 500) // Check every 500ms (less frequent than before)

    return () => clearInterval(interval)
  }, [dimensions, colors])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {/* Calendar header simulation */}
      <div className="flex gap-1 sm:gap-2 px-2 sm:px-4 pt-2 sm:pt-4 pb-1 sm:pb-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
          <motion.div
            key={day}
            className="flex-1 text-center text-[9px] sm:text-[11px] font-bold text-muted-foreground/40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {day}
          </motion.div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div 
        className="grid grid-cols-7 gap-1 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-4 h-full"
        style={{ 
          gridTemplateRows: `repeat(${dimensions.rows}, minmax(0, 1fr))`,
          paddingTop: dimensions.rows > 6 ? '0.5rem' : '1rem'
        }}
      >
        {cells.map((cell) => (
          <motion.div
            key={cell.id}
            className="rounded-md sm:rounded-lg border border-border/10 relative overflow-hidden bg-card/5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: cell.id * 0.01, duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {cell.isActive && (
                <motion.div
                  key={`active-${cell.id}-${cell.nextChangeTime}`}
                  className="absolute inset-0 rounded-md sm:rounded-lg"
                  style={{ 
                    backgroundColor: cell.color,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: cell.intensity * 0.6,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  {/* Single sparkle effect - only on larger screens */}
                  <motion.div
                    className="hidden sm:block absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full"
                    style={{
                      top: `${35 + Math.random() * 30}%`,
                      left: `${35 + Math.random() * 30}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2 + Math.random() * 3,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Day number simulation */}
            <div className="absolute inset-0 flex items-start justify-start p-0.5 sm:p-1">
              <span className="text-[9px] sm:text-[11px] font-semibold text-foreground/25">
                {(cell.id % 28) + 1}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

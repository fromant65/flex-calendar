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

export function SparkleCalendarBg() {
  const [cells, setCells] = useState<CalendarCell[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth <= 640)
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  useEffect(() => {
    // Initialize cells - fixed 6 rows for hero
    const initialCells: CalendarCell[] = []
    let id = 0
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        initialCells.push({
          id: id++,
          row,
          col,
          isActive: Math.random() > 0.55,
          color: colors[Math.floor(Math.random() * colors.length)]!,
          intensity: 0.3 + Math.random() * 0.4,
          nextChangeTime: Date.now() + Math.random() * 3000,
        })
      }
    }
    setCells(initialCells)

    // Optimized update interval
    const interval = setInterval(() => {
      setCells((prevCells) => {
        const now = Date.now()
        let hasChanges = false
        const newCells = prevCells.map((cell) => {
          if (now >= cell.nextChangeTime) {
            hasChanges = true
            const willBeActive = Math.random() > 0.5
            return {
              ...cell,
              isActive: willBeActive,
              color: colors[Math.floor(Math.random() * colors.length)]!,
              intensity: 0.3 + Math.random() * 0.4,
              nextChangeTime: now + 3000 + Math.random() * 5000,
            }
          }
          return cell
        })
        return hasChanges ? newCells : prevCells
      })
    }, 400) // Slightly less frequent checks

    return () => clearInterval(interval)
  }, [colors])

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      {/* Calendar header simulation */}
      <div className="flex gap-1 sm:gap-2 px-2 sm:px-4 pt-2 sm:pt-4 pb-1 sm:pb-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
          <motion.div
            key={day}
            className="flex-1 text-center text-[10px] sm:text-xs font-bold text-muted-foreground/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {day}
          </motion.div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-4">
        {cells.map((cell) => (
          <motion.div
            key={cell.id}
            className="aspect-square rounded-md sm:rounded-lg border border-border/20 relative overflow-hidden bg-card/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: cell.id * 0.01, duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {cell.isActive && (
                <motion.div
                  key={`active-${cell.id}-${cell.nextChangeTime}`}
                  className="absolute inset-0 rounded-md sm:rounded-lg backdrop-blur-sm"
                  style={{ 
                    backgroundColor: cell.color,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: cell.intensity * 0.8,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.9,
                    ease: "easeInOut"
                  }}
                >
                  {/* Multiple sparkle effects - reduced on mobile */}
                  {[...Array(isMobile ? 1 : 2)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/80 rounded-full shadow-lg"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{
                        delay: i * 0.3,
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2 + Math.random() * 2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Day number simulation */}
            <div className="absolute inset-0 flex items-start justify-start p-1 sm:p-1.5">
              <span className="text-[10px] sm:text-xs font-semibold text-foreground/30">
                {(cell.id % 28) + 1}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

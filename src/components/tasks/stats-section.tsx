import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskStats } from "./task-stats"

interface StatsSectionProps {
  tasks: TaskGetMyTasksOutput
}

export function StatsSection({ tasks }: StatsSectionProps) {
  const [showStats, setShowStats] = useState(false)

  return (
    <motion.div 
      className="my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Estadísticas
        </h2>
        <motion.button
          onClick={() => setShowStats(!showStats)}
          className="text-sm text-primary hover:underline focus:outline-none cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showStats ? "Ocultar" : "Mostrar"}
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        {showStats && (
          <motion.div 
            className="rounded-lg border border-border bg-card/20 p-6 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, scaleY: 0, originY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TaskStats tasks={tasks} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskCard } from "./task-card"

type TaskFromList = TaskGetMyTasksOutput[number]

interface InactiveTasksSectionProps {
  tasks: TaskFromList[]
  onEdit: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

export function InactiveTasksSection({
  tasks,
  onEdit,
  onDelete,
  onView,
}: InactiveTasksSectionProps) {
  const [showInactiveTasks, setShowInactiveTasks] = useState(false)

  if (tasks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Tareas Inactivas
          <span className="ml-2 text-sm font-normal">
            ({tasks.length})
          </span>
        </h2>
        <motion.button
          onClick={() => setShowInactiveTasks(!showInactiveTasks)}
          className="text-sm text-primary hover:underline focus:outline-none cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showInactiveTasks ? "Ocultar" : "Mostrar"}
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        {showInactiveTasks && (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={onView}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

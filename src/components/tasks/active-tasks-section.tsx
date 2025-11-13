import { motion } from "framer-motion"
import type { TaskGetMyTasksOutput } from "~/server/api/routers/derived-endpoint-types"
import { TaskCard } from "./task-card"

type TaskFromList = TaskGetMyTasksOutput[number]

interface ActiveTasksSectionProps {
  tasks: TaskFromList[]
  onEdit: (task: TaskFromList) => void
  onDuplicate: (task: TaskFromList) => void
  onDelete: (id: number) => void
  onView: (task: TaskFromList) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export function ActiveTasksSection({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
}: ActiveTasksSectionProps) {
  if (tasks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Tareas Activas
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({tasks.length})
        </span>
      </h2>
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onClick={onView}
            index={index}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
"use client"

import { motion } from "framer-motion"
import { Calendar, Plus } from "lucide-react"

interface EmptyStateProps {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/30 p-16 text-center backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-4 rounded-full bg-muted/50 p-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
      >
        <Calendar className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">No hay tareas creadas</h3>
      <p className="mb-6 text-sm text-muted-foreground">Comienza creando tu primera tarea o hábito</p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
      >
        <Plus className="h-5 w-5" />
        Crear Primera Tarea
      </button>
    </motion.div>
  )
}

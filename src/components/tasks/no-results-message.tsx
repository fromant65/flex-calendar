import { motion } from "framer-motion"

interface NoResultsMessageProps {
  onClearFilters: () => void
}

export function NoResultsMessage({ onClearFilters }: NoResultsMessageProps) {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-muted-foreground">
        No se encontraron tareas con los filtros aplicados.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-4 text-primary hover:underline cursor-pointer"
      >
        Limpiar filtros
      </button>
    </motion.div>
  )
}

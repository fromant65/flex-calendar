interface NoResultsMessageProps {
  onClearFilters: () => void
}

export function NoResultsMessage({ onClearFilters }: NoResultsMessageProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        No se encontraron tareas con los filtros aplicados.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-4 text-primary hover:underline cursor-pointer"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

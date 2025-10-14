import { cn } from "~/lib/utils"

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: "w-3 h-3 border-[1.5px]",
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
}

export function LoadingPage({ text = "Cargando..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}

interface LoadingCardProps {
  text?: string
  className?: string
}

export function LoadingCard({ text = "Cargando...", className }: LoadingCardProps) {
  return (
    <div className={cn("flex items-center justify-center p-12 rounded-xl border border-border bg-card", className)}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

interface LoadingButtonProps {
  className?: string
}

export function LoadingButton({ className }: LoadingButtonProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LoadingSpinner size="xs" />
    </div>
  )
}

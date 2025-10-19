/**
 * InsightCard - Reusable component for displaying insights and analysis messages
 */

import { Card, CardContent } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

interface InsightCardProps {
  title?: string
  message: string
  type?: "info" | "success" | "warning" | "recommendation"
  className?: string
}

export function InsightCard({ title, message, type = "info", className = "" }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 shrink-0" />
      case "warning":
        return <AlertCircle className="h-4 w-4 shrink-0" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4 shrink-0" />
      default:
        return <TrendingUp className="h-4 w-4 shrink-0" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "border-chart-4/50 bg-chart-4/10 text-foreground"
      case "warning":
        return "border-chart-3/50 bg-chart-3/10 text-foreground"
      case "recommendation":
        return "border-primary/50 bg-primary/10 text-foreground"
      default:
        return "border-border bg-muted/50 text-foreground"
    }
  }

  return (
    <Alert className={`${getColorClasses()} w-full !grid-cols-1 !gap-0 ${className}`}>
      <div className="flex items-start gap-3 w-full col-span-full">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <AlertDescription className="text-sm leading-relaxed whitespace-pre-line !col-span-full">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

interface InsightsSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function InsightsSection({ title = "📊 Análisis y Recomendaciones", children, className = "" }: InsightsSectionProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

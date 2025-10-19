"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { TrendingDown, TrendingUp, Activity, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { AdvancedInsights } from "~/types"
import { Progress } from "~/components/ui/progress"
import { useEffect, useState } from "react"
import { InsightCard, InsightsSection as InsightsContainer } from "./insight-card"

interface InsightsSectionProps {
  data: AdvancedInsights
}

export function InsightsSection({ data }: InsightsSectionProps) {
  const [chartColors, setChartColors] = useState({
    text: "#888888",
    border: "#e5e7eb",
    primary: "#0ea5e9"
  })

  useEffect(() => {
    const updateColors = () => {
      const tempText = document.createElement('div')
      tempText.className = 'text-foreground'
      tempText.style.position = 'absolute'
      tempText.style.visibility = 'hidden'
      document.body.appendChild(tempText)
      
      const tempBorder = document.createElement('div')
      tempBorder.className = 'border-border'
      tempBorder.style.position = 'absolute'
      tempBorder.style.visibility = 'hidden'
      document.body.appendChild(tempBorder)

      const tempPrimary = document.createElement('div')
      tempPrimary.className = 'bg-primary'
      tempPrimary.style.position = 'absolute'
      tempPrimary.style.visibility = 'hidden'
      document.body.appendChild(tempPrimary)
      
      const textColor = window.getComputedStyle(tempText).color
      const borderColor = window.getComputedStyle(tempBorder).borderColor || '#e5e7eb'
      const primaryColor = window.getComputedStyle(tempPrimary).backgroundColor
      
      document.body.removeChild(tempText)
      document.body.removeChild(tempBorder)
      document.body.removeChild(tempPrimary)
      
      setChartColors({
        text: textColor || "#888888",
        border: borderColor || "#e5e7eb",
        primary: primaryColor || "#0ea5e9"
      })
    }

    updateColors()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          updateColors()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => observer.disconnect()
  }, [])

  const { lowComplianceHabits, completionTrend, recurringVsUniqueComparison, bottlenecks } = data

  // Calculate trend direction
  const trendDirection =
    completionTrend.length >= 2 &&
    completionTrend[completionTrend.length - 1] &&
    completionTrend[completionTrend.length - 2]
      ? completionTrend[completionTrend.length - 1]!.completionRate -
        completionTrend[completionTrend.length - 2]!.completionRate
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🔮 Insights Avanzados</h2>
        <p className="text-sm text-muted-foreground">
          Análisis predictivo y recomendaciones para mejorar tu productividad
        </p>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Análisis de Tendencia</CardTitle>
              <CardDescription>Evolución del completion rate en el tiempo</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {trendDirection > 0 ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    +{trendDirection.toFixed(1)}%
                  </span>
                </div>
              ) : trendDirection < 0 ? (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {trendDirection.toFixed(1)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm font-medium">Estable</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="[color-scheme:light] dark:[color-scheme:dark]">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={completionTrend} margin={{ left: 20, right: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fill: chartColors.text }}
                  stroke={chartColors.border}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{ 
                    value: "% Completación", 
                    angle: -90, 
                    position: "insideLeft",
                    style: { textAnchor: 'middle', fill: chartColors.text }
                  }}
                  tick={{ fill: chartColors.text }}
                  stroke={chartColors.border}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-popover p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {data.period}
                              </span>
                              <span className="font-bold text-popover-foreground">
                                {data.completionRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Insights */}
          {data.insights && (
            <div className="space-y-3 pt-4 border-t">
              <InsightCard
                type="info"
                message={data.insights.trendAnalysis}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring vs Unique Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación: Recurrentes vs. Únicas</CardTitle>
          <CardDescription>
            ¿Cumples más con hábitos o con tareas puntuales?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tareas Recurrentes (Hábitos)</span>
              <span className="text-sm font-bold">
                {recurringVsUniqueComparison.recurringCompletionRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={recurringVsUniqueComparison.recurringCompletionRate} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tareas Únicas</span>
              <span className="text-sm font-bold">
                {recurringVsUniqueComparison.uniqueCompletionRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={recurringVsUniqueComparison.uniqueCompletionRate} />
          </div>

          {/* Comparison Insight */}
          {data.insights && data.insights.comparisonAnalysis && (
            <div className="pt-4 border-t">
              <InsightCard
                type="info"
                message={data.insights.comparisonAnalysis}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Compliance Habits */}
      {lowComplianceHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hábitos con Bajo Cumplimiento</CardTitle>
            <CardDescription>
              Tareas recurrentes que podrían necesitar atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowComplianceHabits.map((habit) => (
                <div key={habit.taskId} className="flex items-center gap-4 p-3 rounded-lg border">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{habit.taskName}</p>
                    <p className="text-sm text-muted-foreground">
                      {habit.completedOccurrences} de {habit.totalOccurrences} ocurrencias
                      completadas
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {habit.completionRate.toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cuellos de Botella Identificados</CardTitle>
            <CardDescription>
              Tareas con muchas ocurrencias pendientes u omitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks.map((bottleneck) => (
                <div
                  key={bottleneck.taskId}
                  className="flex items-center gap-4 p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{bottleneck.taskName}</p>
                    <p className="text-sm text-muted-foreground">
                      {bottleneck.pendingCount} pendientes, {bottleneck.skippedCount} omitidas de{" "}
                      {bottleneck.totalCount} totales
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Requiere atención
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-medium">Recomendación:</span> Considera dividir estas
                tareas en pasos más pequeños o ajustar sus prioridades.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues */}
      {lowComplianceHabits.length === 0 && bottlenecks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">¡Todo en orden!</h3>
              <p className="text-muted-foreground">
                No se detectaron problemas significativos en tus tareas y hábitos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Recommendation */}
      {data.insights && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Recomendación General</CardTitle>
          </CardHeader>
          <CardContent>
            <InsightCard
              type="recommendation"
              message={data.insights.recommendation}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

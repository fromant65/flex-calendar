"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { CheckCircle2, Clock, Repeat, FileText } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import type { TaskStatsData } from "~/types"
import { useEffect, useState } from "react"
import { InsightCard, InsightsSection } from "./insight-card"
import { InsightsModal } from "./insights-modal"

interface TaskStatsSectionProps {
  data: TaskStatsData
}

export function TaskStatsSection({ data }: TaskStatsSectionProps) {
  const [chartColors, setChartColors] = useState({
    text: "#888888",
    border: "#e5e7eb",
    primary: "#6366f1"
  })

  useEffect(() => {
    const updateColors = () => {
      // Create temporary elements to get the actual computed colors
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
      
      // Get the computed colors
      const textColor = window.getComputedStyle(tempText).color
      const borderColor = window.getComputedStyle(tempBorder).borderColor || '#e5e7eb'
      const primaryColor = window.getComputedStyle(tempPrimary).backgroundColor || '#6366f1'
      
      // Clean up
      document.body.removeChild(tempText)
      document.body.removeChild(tempBorder)
      document.body.removeChild(tempPrimary)
      
      setChartColors({
        text: textColor || "#888888",
        border: borderColor,
        primary: primaryColor
      })
    }

    // Initial update
    updateColors()

    // Listen for theme changes (class changes on html element)
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

  const { averageCompletionTime, importanceDistribution, fixedVsFlexible, recurringVsUnique } = data

  // Prepare data for pie charts
  const fixedFlexibleData = [
    { name: "Tareas Fijas", value: fixedVsFlexible.fixed, color: "#8b5cf6" },
    { name: "Tareas Flexibles", value: fixedVsFlexible.flexible, color: "#06b6d4" },
  ]

  const recurringUniqueData = [
    { name: "Tareas Recurrentes", value: recurringVsUnique.recurring, color: "#f59e0b" },
    { name: "Tareas Únicas", value: recurringVsUnique.unique, color: "#10b981" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">📊 Estadísticas de Tareas</h2>
        <p className="text-sm text-muted-foreground">
          Métricas clave sobre tus tareas y su cumplimiento
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageCompletionTime !== null
                ? `${Math.round(averageCompletionTime)}h`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              De creación a completado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Fijas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixedVsFlexible.fixed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (fixedVsFlexible.fixed / (fixedVsFlexible.fixed + fixedVsFlexible.flexible)) * 100
              )}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Recurrentes</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringVsUnique.recurring}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (recurringVsUnique.recurring / (recurringVsUnique.recurring + recurringVsUnique.unique)) * 100
              )}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Únicas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringVsUnique.unique}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (recurringVsUnique.unique / (recurringVsUnique.recurring + recurringVsUnique.unique)) * 100
              )}
              % del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Importance Distribution Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <CardTitle>Distribución por Importancia</CardTitle>
                <CardDescription>
                  Porcentaje de completación de ocurrencias por nivel de importancia
                </CardDescription>
              </div>
              {data.insights && (
                <InsightsModal
                  title="Análisis de Tareas"
                  description="Análisis detallado de la distribución y completación de tareas por importancia"
                  insights={[
                    {
                      title: "Tendencia de Completación",
                      message: data.insights.completionTrendMessage,
                      type: "info",
                    },
                    {
                      title: "Análisis de Importancia",
                      message: data.insights.importanceAnalysis,
                      type: "info",
                    },
                    {
                      title: "Recomendación",
                      message: data.insights.recommendation,
                      type: "recommendation",
                    },
                  ]}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={importanceDistribution} margin={{ left: 20, right: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                  <XAxis
                    dataKey="importance"
                    tick={{ fill: chartColors.text }}
                    stroke={chartColors.border}
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
                                  Importancia {data.importance}
                                </span>
                                <span className="font-bold text-popover-foreground">
                                  {data.completionRate.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {data.completedOccurrences} de {data.totalOccurrences} ocurrencias
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="completionRate" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fixed vs Flexible Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Fijas vs. Flexibles</CardTitle>
            <CardDescription>Distribución por tipo de horario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={fixedFlexibleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {fixedFlexibleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={({ payload }) => (
                      <div className="flex justify-center gap-4 mt-2">
                        {payload?.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-foreground">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0]) {
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-popover-foreground font-medium">
                                {payload[0].name}
                              </span>
                              <span className="text-sm font-bold text-popover-foreground">
                                {payload[0].value} tareas
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recurring vs Unique Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Recurrentes vs. Únicas</CardTitle>
            <CardDescription>Distribución por tipo de repetición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={recurringUniqueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {recurringUniqueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={({ payload }) => (
                      <div className="flex justify-center gap-4 mt-2">
                        {payload?.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-foreground">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0]) {
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-popover-foreground font-medium">
                                {payload[0].name}
                              </span>
                              <span className="text-sm font-bold text-popover-foreground">
                                {payload[0].value} tareas
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { TrendingUp, Award, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import type { RecurrenceStatsData } from "~/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useState } from "react"
import { InsightCard, InsightsSection } from "./insight-card"
import { InsightsModal } from "./insights-modal"

interface RecurrenceStatsSectionProps {
  data: RecurrenceStatsData
}

export function RecurrenceStatsSection({ data }: RecurrenceStatsSectionProps) {
  const [chartColors, setChartColors] = useState({
    text: "#888888",
    border: "#e5e7eb",
    primary: "#6366f1"
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
      const primaryColor = window.getComputedStyle(tempPrimary).backgroundColor || '#6366f1'
      
      document.body.removeChild(tempText)
      document.body.removeChild(tempBorder)
      document.body.removeChild(tempPrimary)
      
      setChartColors({
        text: textColor || "#888888",
        border: borderColor,
        primary: primaryColor
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

  const { habitCompliance, maxStreak, currentStreak, frequentDays } = data

  // Format compliance data for chart
  const complianceChartData = habitCompliance.map((point) => ({
    ...point,
    dateLabel: format(new Date(point.date), "dd MMM", { locale: es }),
  }))

  // Sort days in week order
  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const sortedDays = [...frequentDays].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  )

  const dayNames: Record<string, string> = {
    Mon: "Lun",
    Tue: "Mar",
    Wed: "Mié",
    Thu: "Jue",
    Fri: "Vie",
    Sat: "Sáb",
    Sun: "Dom",
  }

  const daysChartData = sortedDays.map((d) => ({
    day: dayNames[d.day],
    completionRate: d.completionRate,
    completionCount: d.completionCount,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🔁 Estadísticas de Recurrencias</h2>
        <p className="text-sm text-muted-foreground">
          Seguimiento de hábitos y patrones de cumplimiento
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak === 1 ? "período" : "períodos"} consecutivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Máxima</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxStreak}</div>
            <p className="text-xs text-muted-foreground">
              Tu mejor récord histórico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {habitCompliance.length > 0
                ? Math.round(
                    habitCompliance.reduce((sum, p) => sum + p.completionRate, 0) /
                      habitCompliance.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              En los últimos períodos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        {/* Habit Compliance Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <CardTitle>Cumplimiento de Hábitos</CardTitle>
                <CardDescription>
                  Evolución del porcentaje de ocurrencias completadas a lo largo del tiempo
                </CardDescription>
              </div>
              {data.insights && (
                <InsightsModal
                  title="Análisis de Hábitos Recurrentes"
                  description="Análisis detallado del cumplimiento y evolución de tus hábitos"
                  insights={[
                    {
                      title: "Análisis de Cumplimiento",
                      message: data.insights.complianceAnalysis,
                      type: "info",
                    },
                    {
                      title: "Evolución",
                      message: data.insights.evolutionAnalysis,
                      type: data.insights.evolutionAnalysis.includes('aumentado') || 
                             data.insights.evolutionAnalysis.includes('creciendo')
                        ? 'success'
                        : data.insights.evolutionAnalysis.includes('disminuido') ||
                          data.insights.evolutionAnalysis.includes('bajando')
                        ? 'warning'
                        : 'info',
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
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceChartData} margin={{ left: 20, right: 30, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fill: chartColors.text }}
                    stroke={chartColors.border}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    label={{ 
                      value: "% Finalización", 
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
                      if (active && payload?.length && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {data.dateLabel}
                                </span>
                                <span className="font-bold text-popover-foreground">
                                  {data.completionRate.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {data.completedOccurrences} de {data.totalOccurrences} completadas
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
          </CardContent>
        </Card>

        {/* Frequent Days Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Días Más Frecuentes de Finalización</CardTitle>
            <CardDescription>
              Tasa de finalización por día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={daysChartData} margin={{ left: 20, right: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: chartColors.text }}
                    stroke={chartColors.border}
                  />
                  <YAxis
                    label={{ 
                      value: "% finalización", 
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
                      if (active && payload?.length && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-popover p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {data.day}
                                </span>
                                <span className="font-bold text-popover-foreground">
                                  {data.completionRate.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{data.completionCount} completadas</span>
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
      </div>
    </div>
  )
}

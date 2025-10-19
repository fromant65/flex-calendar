"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Activity, Clock, TrendingDown, AlertCircle } from "lucide-react"
import {
  LineChart,
  Line,
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
import type { OccurrenceStatsData } from "~/types"
import { useEffect, useState } from "react"

interface OccurrenceStatsSectionProps {
  data: OccurrenceStatsData
}

export function OccurrenceStatsSection({ data }: OccurrenceStatsSectionProps) {
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

  const {
    occurrencesByPeriod,
    statusDistribution,
    averageTimeDeviation,
    averageUrgency,
    averageResolutionTime,
  } = data

  // Status data for pie chart
  const statusData = [
    { name: "Completadas", value: statusDistribution.completed, color: "#10b981" },
    { name: "Pendientes", value: statusDistribution.pending, color: "#f59e0b" },
    { name: "En Progreso", value: statusDistribution.inProgress, color: "#3b82f6" },
    { name: "Omitidas", value: statusDistribution.skipped, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  const totalOccurrences = Object.values(statusDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">📅 Estadísticas de Ocurrencias</h2>
        <p className="text-sm text-muted-foreground">
          Análisis detallado de las instancias individuales de tus tareas
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocurrencias</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccurrences}</div>
            <p className="text-xs text-muted-foreground">Generadas en el período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Resolución</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResolutionTime !== null ? `${Math.round(averageResolutionTime)}h` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Promedio desde inicio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desviación de Tiempo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageTimeDeviation !== null
                ? `${averageTimeDeviation > 0 ? "+" : ""}${Math.round(averageTimeDeviation * 60)}m`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {averageTimeDeviation !== null && averageTimeDeviation < 0
                ? "Bajo lo planificado"
                : "Sobre lo planificado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgencia Promedio</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageUrgency !== null ? averageUrgency.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">De ocurrencias completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Occurrences by Period */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ocurrencias por Período</CardTitle>
            <CardDescription>
              Número de ocurrencias generadas semanalmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occurrencesByPeriod} margin={{ left: 20, right: 30, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: chartColors.text }}
                    stroke={chartColors.border}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    label={{ 
                      value: "Cantidad", 
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
                                  {data.period}
                                </span>
                                <span className="font-bold text-popover-foreground">{data.count} ocurrencias</span>
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
                    dataKey="count"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartColors.primary, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: chartColors.primary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Estado actual de todas las ocurrencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="[color-scheme:light] dark:[color-scheme:dark]">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      content={({ payload }) => (
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {payload?.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-xs text-foreground">{entry.value}</span>
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
                                  {payload[0].value} ocurrencias
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

              <div className="flex flex-col justify-center space-y-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {((item.value / totalOccurrences) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

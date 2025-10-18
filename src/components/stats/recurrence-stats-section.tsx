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

interface RecurrenceStatsSectionProps {
  data: RecurrenceStatsData
}

export function RecurrenceStatsSection({ data }: RecurrenceStatsSectionProps) {
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
            <CardTitle>Cumplimiento de Hábitos</CardTitle>
            <CardDescription>
              Evolución del porcentaje de ocurrencias completadas a lo largo del tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{ value: "% Completación", angle: -90, position: "insideLeft" }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
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
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequent Days Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Días Más Frecuentes de Cumplimiento</CardTitle>
            <CardDescription>
              Tasa de completación por día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={daysChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{ value: "% Completación", angle: -90, position: "insideLeft" }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
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
                <Bar dataKey="completionRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { CheckCircle, XCircle, Target } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { CalendarStatsData } from "~/types"

interface CalendarStatsSectionProps {
  data: CalendarStatsData
}

export function CalendarStatsSection({ data }: CalendarStatsSectionProps) {
  const { completedVsIncomplete, hourlyDistribution, complianceRate } = data

  // Completed vs incomplete data
  const completionData = [
    {
      name: "Completados",
      value: completedVsIncomplete.completed,
      color: "#10b981",
    },
    {
      name: "Incompletos",
      value: completedVsIncomplete.incomplete,
      color: "#ef4444",
    },
  ]

  const totalEvents = completedVsIncomplete.completed + completedVsIncomplete.incomplete

  // Get max count for heatmap normalization
  const maxCount = Math.max(...hourlyDistribution.map((h) => h.count))

  // Helper function to get color intensity
  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-muted"
    const intensity = Math.ceil((count / maxCount) * 4)
    const colors = [
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary/80",
      "bg-primary",
    ]
    return colors[intensity] || colors[0]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🗓️ Estadísticas de Calendario</h2>
        <p className="text-sm text-muted-foreground">
          Análisis de eventos programados y su cumplimiento
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVsIncomplete.completed}</div>
            <p className="text-xs text-muted-foreground">
              {totalEvents > 0
                ? Math.round((completedVsIncomplete.completed / totalEvents) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Incompletos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVsIncomplete.incomplete}</div>
            <p className="text-xs text-muted-foreground">
              {totalEvents > 0
                ? Math.round((completedVsIncomplete.incomplete / totalEvents) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cumplimiento</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">De eventos marcados como completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Completion Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Completados vs. No Completados</CardTitle>
            <CardDescription>Distribución general de cumplimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="[color-scheme:light] dark:[color-scheme:dark]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {completionData.map((entry, index) => (
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
                                {payload[0].value} eventos
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

        {/* Hourly Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución Horaria</CardTitle>
            <CardDescription>Franjas del día con más eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1">
                {hourlyDistribution.map((hour) => (
                  <div
                    key={hour.hour}
                    className={`aspect-square rounded-sm ${getHeatmapColor(hour.count)} relative group cursor-pointer transition-all hover:scale-110`}
                    title={`${hour.hour}:00 - ${hour.count} eventos (${hour.completionRate.toFixed(0)}% completados)`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[0.6rem] font-bold text-foreground">
                        {hour.hour}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
                <span>18h</span>
                <span>23h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Hourly Table */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Hora</CardTitle>
          <CardDescription>
            Número de eventos y tasa de completación por franja horaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {hourlyDistribution
              .filter((h) => h.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
              .map((hour) => (
                <div
                  key={hour.hour}
                  className="flex flex-col items-center justify-center rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="text-lg font-bold">{hour.hour}:00</div>
                  <div className="text-sm text-muted-foreground">{hour.count} eventos</div>
                  <div className="text-xs text-primary font-medium mt-1">
                    {hour.completionRate.toFixed(0)}% completados
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

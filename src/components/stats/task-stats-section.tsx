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

interface TaskStatsSectionProps {
  data: TaskStatsData
}

export function TaskStatsSection({ data }: TaskStatsSectionProps) {
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
      <div className="grid gap-6 md:grid-cols-2">
        {/* Importance Distribution Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Distribución por Importancia</CardTitle>
            <CardDescription>
              Porcentaje de completación de ocurrencias por nivel de importancia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={importanceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="importance"
                  label={{ value: "Importancia", position: "insideBottom", offset: -5 }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{ value: "% Completación", angle: -90, position: "insideLeft" }}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  stroke="hsl(var(--border))"
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
                <Bar dataKey="completionRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fixed vs Flexible Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Fijas vs. Flexibles</CardTitle>
            <CardDescription>Distribución por tipo de horario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={fixedFlexibleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {fixedFlexibleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recurring vs Unique Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Recurrentes vs. Únicas</CardTitle>
            <CardDescription>Distribución por tipo de repetición</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={recurringUniqueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {recurringUniqueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

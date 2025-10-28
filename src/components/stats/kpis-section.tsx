"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { TrendingUp, Clock, Gauge, Briefcase, Award, AlertTriangle } from "lucide-react"
import { Progress } from "../ui/progress"
import type { GlobalKPIs } from "~/types"
import { InsightCard, InsightsSection } from "./insight-card"

interface KPIsSectionProps {
  data: GlobalKPIs
}

export function KPIsSection({ data }: KPIsSectionProps) {
  const {
    completionRate,
    totalTimeInvested,
    planningEfficiency,
    averageWorkload,
    importanceBalance,
    urgencyBalance,
  } = data

  // Helper to get color based on percentage
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500"
    if (value >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">📈 KPIs Globales de Productividad</h2>
        <p className="text-sm text-muted-foreground">
          Indicadores clave de rendimiento general
        </p>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              De todas las ocurrencias creadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Invertido</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTimeInvested)}h</div>
            <p className="text-xs text-muted-foreground mt-2">
              {(totalTimeInvested / 24).toFixed(1)} días equivalentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia de Planificación</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planningEfficiency !== null ? planningEfficiency.toFixed(2) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {planningEfficiency !== null
                ? planningEfficiency > 1
                  ? "Planificas menos de lo que consumes"
                  : "Planificas más de lo que consumes"
                : "Sin datos suficientes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga de Trabajo</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWorkload.hoursPerWeek.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-2">
              Por semana ({averageWorkload.hoursPerDay.toFixed(1)}h/día promedio)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall Performance Insight */}
        {data.insights && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <InsightCard
                type="info"
                message={data.insights.overallPerformanceAnalysis}
              />
            </CardContent>
          </Card>
        )}

        {/* Importance Balance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Balance entre Importancia y Cumplimiento</CardTitle>
                <CardDescription>
                  ¿Se completan más las tareas críticas o las de baja importancia?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Alta Importancia (8-10)</span>
                <span className="text-sm font-bold text-primary">
                  {importanceBalance.highImportanceCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={importanceBalance.highImportanceCompletionRate}
                className={getProgressColor(importanceBalance.highImportanceCompletionRate)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Importancia Media (4-7)</span>
                <span className="text-sm font-bold">
                  {importanceBalance.mediumImportanceCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={importanceBalance.mediumImportanceCompletionRate}
                className={getProgressColor(importanceBalance.mediumImportanceCompletionRate)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Baja Importancia (1-3)</span>
                <span className="text-sm font-bold">
                  {importanceBalance.lowImportanceCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={importanceBalance.lowImportanceCompletionRate}
                className={getProgressColor(importanceBalance.lowImportanceCompletionRate)}
              />
            </div>

          </CardContent>
        </Card>

        {/* Urgency Balance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Balance entre Urgencia y Cumplimiento</CardTitle>
                <CardDescription>
                  ¿Completas tareas con anticipación o cerca del límite?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Con Anticipación (&gt;50% tiempo)</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {urgencyBalance.earlyCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={urgencyBalance.earlyCompletionRate}
                className="bg-green-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">A Tiempo (10-50% tiempo)</span>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  {urgencyBalance.onTimeCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={urgencyBalance.onTimeCompletionRate}
                className="bg-yellow-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tarde (&lt;10% tiempo)</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {urgencyBalance.lateCompletionRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={urgencyBalance.lateCompletionRate}
                className="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency and Recommendations */}
      {data.insights && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Eficiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <InsightCard
                type="info"
                message={data.insights.efficiencyAnalysis}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendación Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <InsightCard
                type="recommendation"
                message={data.insights.recommendation}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

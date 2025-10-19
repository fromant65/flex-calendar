/**
 * Task Stats Insights Generator
 */

import type { TaskStatsData } from "~/types";

export class TaskStatsInsightsGenerator {
  static generate(data: TaskStatsData): {
    completionTrendMessage: string;
    importanceAnalysis: string;
    recommendation: string;
  } {
    const { importanceDistribution } = data;

    // Analyze importance distribution
    const highImportance = importanceDistribution.filter(d => d.importance >= 8);
    const mediumImportance = importanceDistribution.filter(d => d.importance >= 4 && d.importance < 8);
    const lowImportance = importanceDistribution.filter(d => d.importance < 4);

    const highCompletionRate = this.getAverageCompletionRate(highImportance);
    const mediumCompletionRate = this.getAverageCompletionRate(mediumImportance);
    const lowCompletionRate = this.getAverageCompletionRate(lowImportance);

    // Determine overall completion pattern
    let completionTrendMessage = "";
    let importanceAnalysis = "";
    let recommendation = "";

    // Overall trend analysis
    const overallCompletion = this.getAverageCompletionRate(importanceDistribution);
    if (overallCompletion >= 80) {
      completionTrendMessage = "🎯 Excelente porcentaje de completación general. Mantienes un ritmo muy productivo.";
    } else if (overallCompletion >= 60) {
      completionTrendMessage = "📊 Tu porcentaje de completación es bueno, pero hay espacio para mejorar.";
    } else if (overallCompletion >= 40) {
      completionTrendMessage = "⚠️ Tu porcentaje de completación es medio-bajo. Considera revisar tu planificación.";
    } else {
      completionTrendMessage = "🚨 Tu porcentaje de completación es bajo. Es momento de reevaluar tu carga de trabajo.";
    }

    // Importance pattern analysis
    if (highCompletionRate > lowCompletionRate + 20) {
      importanceAnalysis = "✅ Priorizas correctamente las tareas importantes. Las tareas de alta importancia se completan con mayor frecuencia que las de baja importancia.";
      recommendation = "Continúa enfocándote en las tareas críticas. Considera delegar o eliminar tareas de baja importancia.";
    } else if (lowCompletionRate > highCompletionRate + 20) {
      importanceAnalysis = "⚠️ Completas más tareas de baja importancia que las críticas. Esto puede indicar procrastinación o evasión de tareas difíciles.";
      recommendation = "🎯 Recomendación: Utiliza la Matriz de Eisenhower para enfocarte primero en las tareas importantes. Dedica las primeras horas del día a las tareas de alta prioridad.";
    } else if (Math.abs(highCompletionRate - mediumCompletionRate) < 10 && Math.abs(mediumCompletionRate - lowCompletionRate) < 10) {
      importanceAnalysis = "📊 Completas tareas de forma equilibrada sin importar su nivel de importancia. Esto puede indicar falta de priorización.";
      recommendation = "💡 Sugerencia: Implementa el método 'Eat the Frog' - comienza el día con la tarea más importante y difícil.";
    } else if (mediumCompletionRate > highCompletionRate && mediumCompletionRate > lowCompletionRate) {
      importanceAnalysis = "🔄 Te enfocas principalmente en tareas de importancia media. Las tareas críticas y las menos importantes quedan rezagadas.";
      recommendation = "⚡ Busca equilibrio: dedica bloques específicos a tareas de alta importancia y decide conscientemente cuáles tareas de baja importancia descartar.";
    } else {
      importanceAnalysis = "📈 Tu patrón de completación muestra variabilidad en la priorización de tareas.";
      recommendation = "📝 Evalúa semanalmente qué tipos de tareas completas más y ajusta tu estrategia según tus objetivos.";
    }

    // Additional context based on average completion time
    if (data.averageCompletionTime !== null) {
      const avgHours = data.averageCompletionTime;
      if (avgHours < 24) {
        recommendation += " Completas tareas rápidamente, lo cual es excelente para mantener el momentum.";
      } else if (avgHours > 168) { // More than a week
        recommendation += " Las tareas tardan mucho en completarse. Considera dividir tareas grandes en subtareas más manejables.";
      }
    }

    return {
      completionTrendMessage,
      importanceAnalysis,
      recommendation,
    };
  }

  private static getAverageCompletionRate(items: { completionRate: number }[]): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.completionRate, 0);
    return sum / items.length;
  }
}

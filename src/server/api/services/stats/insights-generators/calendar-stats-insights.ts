/**
 * Calendar Stats Insights Generator
 */

import type { CalendarStatsData } from "~/types";

export class CalendarStatsInsightsGenerator {
  static generate(data: CalendarStatsData): {
    overallCompletionAnalysis: string;
    timePatternAnalysis: string;
    recommendation: string;
  } {
    const { completedVsIncomplete, hourlyDistribution, complianceRate } = data;

    const total = completedVsIncomplete.completed + completedVsIncomplete.incomplete;
    
    // Analyze overall completion
    let overallCompletionAnalysis = "";
    if (complianceRate >= 80) {
      overallCompletionAnalysis = "🌟 Excelente cumplimiento de eventos programados. Respetas tu calendario de forma consistente.";
    } else if (complianceRate >= 60) {
      overallCompletionAnalysis = "✅ Buen cumplimiento de eventos. Generalmente sigues tu planificación horaria.";
    } else if (complianceRate >= 40) {
      overallCompletionAnalysis = "⚠️ Cumplimiento medio de eventos. Frecuentemente te desvías de tu planificación.";
    } else {
      overallCompletionAnalysis = "🚨 Bajo cumplimiento de eventos. Tu calendario no refleja lo que realmente haces.";
    }

    // Analyze time patterns
    const peakHours = hourlyDistribution
      .filter(h => h.count > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);
    
    const lowPerformanceHours = hourlyDistribution
      .filter(h => h.count >= 2) // Only consider hours with enough data
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 3);

    let timePatternAnalysis = "";
    if (peakHours.length > 0 && lowPerformanceHours.length > 0) {
      const bestHour = peakHours[0];
      const worstHour = lowPerformanceHours[0];
      
      if (bestHour && worstHour) {
        const bestTime = this.getTimeOfDay(bestHour.hour);
        const worstTime = this.getTimeOfDay(worstHour.hour);
        
        timePatternAnalysis = `⏰ Patrones horarios: Tus mejores horas de cumplimiento son ${bestTime} (${bestHour.completionRate.toFixed(0)}% completado). `;
        timePatternAnalysis += `Tu rendimiento baja ${worstTime} (${worstHour.completionRate.toFixed(0)}% completado).`;
      }
    } else {
      timePatternAnalysis = "📊 Aún no hay suficientes datos para identificar patrones horarios claros.";
    }

    // Generate recommendation
    let recommendation = "";
    if (complianceRate < 50) {
      recommendation = "🎯 Tu calendario está sobrecargado o poco realista. Reduce el número de eventos fijos y deja más espacio para lo inesperado.";
    } else if (peakHours.length > 0 && lowPerformanceHours.length > 0) {
      const bestHour = peakHours[0];
      if (bestHour && bestHour.hour >= 6 && bestHour.hour <= 11) {
        recommendation = "🌅 Aprovecha tus mañanas productivas para tareas importantes. Programa eventos menos críticos para horas de menor rendimiento.";
      } else if (bestHour && bestHour.hour >= 20) {
        recommendation = "🌙 Eres más productivo por la noche. Respeta tu cronotipo y organiza tu día en consecuencia.";
      } else {
        recommendation = "⏰ Identifica tus horas de mayor energía y reserva esos bloques para trabajo profundo, no para reuniones.";
      }
    } else if (complianceRate >= 75) {
      recommendation = "✨ Tu disciplina con el calendario es excelente. Asegúrate de incluir también tiempo de descanso y flexibilidad.";
    } else {
      recommendation = "📅 Revisa semanalmente qué eventos no cumples y por qué. Ajusta tu planificación basándote en esos datos.";
    }

    return {
      overallCompletionAnalysis,
      timePatternAnalysis,
      recommendation,
    };
  }

  private static getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return "en la mañana";
    if (hour >= 12 && hour < 14) return "al mediodía";
    if (hour >= 14 && hour < 18) return "en la tarde";
    if (hour >= 18 && hour < 22) return "en la noche";
    return "en la madrugada";
  }
}

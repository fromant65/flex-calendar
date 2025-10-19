/**
 * Recurrence Stats Insights Generator
 */

import type { RecurrenceStatsData } from "~/types";

export class RecurrenceStatsInsightsGenerator {
  static generate(data: RecurrenceStatsData): {
    complianceAnalysis: string;
    evolutionAnalysis: string;
    recommendation: string;
  } {
    const { habitCompliance, maxStreak, currentStreak } = data;

    // Calculate average compliance
    const avgCompliance = habitCompliance.length > 0
      ? habitCompliance.reduce((sum, p) => sum + p.completionRate, 0) / habitCompliance.length
      : 0;

    // Analyze evolution (compare recent vs older periods)
    let evolutionTrend: "increasing" | "decreasing" | "stable" = "stable";
    if (habitCompliance.length >= 4) {
      const recent = habitCompliance.slice(-2).reduce((sum, p) => sum + p.completionRate, 0) / 2;
      const older = habitCompliance.slice(0, 2).reduce((sum, p) => sum + p.completionRate, 0) / 2;
      const difference = recent - older;
      
      if (difference > 10) evolutionTrend = "increasing";
      else if (difference < -10) evolutionTrend = "decreasing";
    }

    // Generate compliance analysis
    let complianceAnalysis = "";
    if (avgCompliance >= 80) {
      complianceAnalysis = "🌟 Excelente cumplimiento de hábitos. Mantenes una consistencia sobresaliente en tus rutinas.";
    } else if (avgCompliance >= 60) {
      complianceAnalysis = "✅ Buen cumplimiento de hábitos. Mantenes una consistencia sólida, aunque hay margen de mejora.";
    } else if (avgCompliance >= 40) {
      complianceAnalysis = "⚠️ Cumplimiento medio de hábitos. Tus rutinas son irregulares y necesitan más atención.";
    } else {
      complianceAnalysis = "🚨 Cumplimiento bajo de hábitos. Tienes dificultades para mantener la consistencia en tus rutinas.";
    }

    // Generate evolution analysis
    let evolutionAnalysis = "";
    if (evolutionTrend === "increasing") {
      evolutionAnalysis = "📈 Tendencia positiva: Tu consistencia está mejorando con el tiempo. ¡Continúa así!";
    } else if (evolutionTrend === "decreasing") {
      evolutionAnalysis = "📉 Tendencia negativa: Tu consistencia ha disminuido recientemente. Es importante identificar qué ha cambiado.";
    } else {
      evolutionAnalysis = "➡️ Tendencia estable: Tu nivel de consistencia se mantiene constante en el tiempo.";
    }

    // Check if trend is desirable
    const trendDesirability = this.analyzeTrendDesirability(avgCompliance, evolutionTrend);
    evolutionAnalysis += " " + trendDesirability;

    // Generate recommendation
    let recommendation = "";
    if (avgCompliance < 60) {
      recommendation = "💪 Recomendación: Reduce el número de hábitos simultáneos. Es mejor mantener 2-3 hábitos consistentemente que intentar muchos sin éxito. ";
    } else if (currentStreak < maxStreak / 2 && maxStreak > 5) {
      recommendation = "🔥 Has logrado rachas más largas antes. Identifica qué funcionaba en esos momentos y replícalo. ";
    } else if (avgCompliance >= 80 && currentStreak >= 7) {
      recommendation = "🎯 ¡Estás en una excelente racha! Considera añadir un nuevo hábito complementario a tu rutina. ";
    }

    // Add context about evolution
    if (evolutionTrend === "decreasing") {
      recommendation += "Reflexiona sobre cambios recientes en tu vida que puedan estar afectando tu consistencia. Ajusta tus expectativas si es necesario.";
    } else if (evolutionTrend === "increasing") {
      recommendation += "El progreso gradual es sostenible. Mantén el enfoque en la mejora continua sin presionarte demasiado.";
    } else {
      recommendation += "La estabilidad es valiosa. Asegúrate de que este nivel de consistencia te acerque a tus objetivos a largo plazo.";
    }

    return {
      complianceAnalysis,
      evolutionAnalysis,
      recommendation,
    };
  }

  private static analyzeTrendDesirability(
    avgCompliance: number,
    trend: "increasing" | "decreasing" | "stable"
  ): string {
    if (trend === "increasing") {
      return avgCompliance < 60
        ? "Esta mejora es exactamente lo que necesitas."
        : "Continúa con esta trayectoria positiva.";
    } else if (trend === "decreasing") {
      return avgCompliance > 70
        ? "Aunque tu base es sólida, cuida no perder momentum."
        : "Esta disminución requiere atención inmediata para evitar perder el hábito.";
    } else {
      return avgCompliance >= 70
        ? "La estabilidad en un nivel alto es ideal."
        : "Necesitas romper este plateau con cambios estratégicos.";
    }
  }
}

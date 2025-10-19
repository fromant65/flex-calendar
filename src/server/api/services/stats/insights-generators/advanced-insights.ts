/**
 * Advanced Insights Generator
 */

import type { AdvancedInsights } from "~/types";

export class AdvancedInsightsGenerator {
  static generate(data: AdvancedInsights): {
    trendAnalysis: string;
    comparisonAnalysis: string;
    recommendation: string;
  } {
    const { completionTrend, recurringVsUniqueComparison, lowComplianceHabits } = data;

    // Analyze trend
    const trendDirection = completionTrend.length >= 2 &&
      completionTrend[completionTrend.length - 1] &&
      completionTrend[completionTrend.length - 2]
        ? completionTrend[completionTrend.length - 1]!.completionRate -
          completionTrend[completionTrend.length - 2]!.completionRate
        : 0;

    const avgCompletionRate = completionTrend.length > 0
      ? completionTrend.reduce((sum, p) => sum + p.completionRate, 0) / completionTrend.length
      : 0;

    let trendAnalysis = "";
    if (trendDirection > 5) {
      trendAnalysis = "📈 Tendencia ascendente: Tu productividad está mejorando consistentemente. ";
      // Analyze if trend is desirable
      if (avgCompletionRate < 60) {
        trendAnalysis += "Esta mejora es crítica y necesaria. Continúa con el momentum.";
      } else if (avgCompletionRate >= 75) {
        trendAnalysis += "Ya tienes una base sólida y sigues mejorando. ¡Excelente progreso sostenible!";
      } else {
        trendAnalysis += "Vas en la dirección correcta hacia un rendimiento óptimo.";
      }
    } else if (trendDirection < -5) {
      trendAnalysis = "📉 Tendencia descendente: Tu productividad ha disminuido recientemente. ";
      // Analyze if trend is problematic
      if (avgCompletionRate >= 70) {
        trendAnalysis += "Aunque tu base sigue siendo sólida, es importante frenar esta caída antes de que se convierta en hábito.";
      } else if (avgCompletionRate < 50) {
        trendAnalysis += "Esta disminución es preocupante y requiere acción inmediata. Identifica las causas raíz.";
      } else {
        trendAnalysis += "Necesitas identificar qué cambió y recuperar tu nivel de productividad anterior.";
      }
    } else {
      trendAnalysis = "➡️ Tendencia estable: Tu productividad se mantiene constante. ";
      // Analyze if stability is desirable
      if (avgCompletionRate >= 75) {
        trendAnalysis += "La estabilidad en un nivel alto es ideal. Has encontrado un ritmo sostenible.";
      } else if (avgCompletionRate < 50) {
        trendAnalysis += "La estabilidad en un nivel bajo no es deseable. Necesitas romper este plateau con cambios estratégicos.";
      } else {
        trendAnalysis += "Hay espacio para mejorar. Considera qué ajustes podrían elevar tu rendimiento.";
      }
    }

    // Comparison analysis
    const recurringDiff = recurringVsUniqueComparison.recurringCompletionRate - 
                         recurringVsUniqueComparison.uniqueCompletionRate;
    
    let comparisonAnalysis = "";
    if (Math.abs(recurringDiff) < 10) {
      comparisonAnalysis = "⚖️ Balance equilibrado: Mantienes consistencia similar entre tareas recurrentes y únicas. ";
      // Determine if this balance is good
      if (recurringVsUniqueComparison.recurringCompletionRate >= 70) {
        comparisonAnalysis += "Esta consistencia uniforme en ambos tipos es muy valiosa.";
      } else {
        comparisonAnalysis += "Sin embargo, ambos tipos necesitan mejorar. El problema es general, no específico de un tipo.";
      }
    } else if (recurringDiff > 15) {
      comparisonAnalysis = "🔁 Mayor consistencia en tareas recurrentes: Los hábitos te resultan más fáciles de mantener que las tareas únicas. ";
      // Analyze if this is optimal
      comparisonAnalysis += "Esto indica buena disciplina con rutinas. Considera aplicar estructura similar a tareas únicas (bloques de tiempo fijos, recordatorios).";
    } else if (recurringDiff < -15) {
      comparisonAnalysis = "⚡ Mayor consistencia en tareas únicas: Completas mejor las tareas puntuales que los hábitos. ";
      // Analyze implications
      comparisonAnalysis += "Puede que los hábitos actuales no estén bien integrados en tu rutina o no sean suficientemente motivantes. Revisa si cada hábito realmente aporta valor.";
    } else if (recurringDiff > 0) {
      // Diferencia entre 10 y 15
      comparisonAnalysis = "🔁 Ligera ventaja en tareas recurrentes: Los hábitos te resultan algo más fáciles. ";
      comparisonAnalysis += "Aunque la diferencia es pequeña, indica una tendencia hacia mejor disciplina en rutinas establecidas.";
    } else {
      // Diferencia entre -10 y -15
      comparisonAnalysis = "⚡ Ligera ventaja en tareas únicas: Las tareas puntuales te resultan algo más manejables. ";
      comparisonAnalysis += "La diferencia es mínima, pero sugiere que podrías beneficiarte de mayor estructura en tus hábitos.";
    }

    // Generate recommendation
    let recommendation = "";
    if (lowComplianceHabits.length >= 3) {
      recommendation = `🎯 Tienes ${lowComplianceHabits.length} hábitos con bajo cumplimiento. Considera pausar o eliminar los menos valiosos y enfócate en 1-2 hábitos prioritarios. `;
    }

    if (trendDirection < -5 && avgCompletionRate < 60) {
      recommendation += "⚠️ Acción urgente: La tendencia negativa requiere intervención. Realiza una auditoría completa de tus compromisos. ";
    } else if (trendDirection > 5 && avgCompletionRate >= 70) {
      recommendation += "✨ Momento ideal para optimizar: Tu momentum positivo te permite experimentar con nuevas técnicas sin riesgo. ";
    }

    if (recurringDiff < -15) {
      recommendation += "Transforma hábitos en eventos fijos en tu calendario para darles la estructura que necesitan.";
    } else if (recurringDiff > 15) {
      recommendation += "Aplica la disciplina de tus hábitos a proyectos únicos usando técnicas de 'tempting bundling' (asociar tareas únicas con actividades placenteras).";
    } else if (avgCompletionRate < 60) {
      recommendation += "Implementa una 'semana de reset': pausar nuevos compromisos y completar todo lo pendiente para empezar fresco.";
    } else {
      recommendation += "Continúa monitoreando estas métricas semanalmente para detectar cambios tempranos.";
    }

    return {
      trendAnalysis,
      comparisonAnalysis,
      recommendation,
    };
  }
}

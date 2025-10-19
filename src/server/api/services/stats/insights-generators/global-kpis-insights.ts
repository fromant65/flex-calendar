/**
 * Global KPIs Insights Generator
 */

import type { GlobalKPIs } from "~/types";

export class GlobalKPIsInsightsGenerator {
  static generate(data: GlobalKPIs): {
    overallPerformanceAnalysis: string;
    balanceAnalysis: string;
    efficiencyAnalysis: string;
    recommendation: string;
  } {
    const {
      completionRate,
      planningEfficiency,
      importanceBalance,
      urgencyBalance,
    } = data;

    // Overall performance
    let overallPerformanceAnalysis = "";
    if (completionRate >= 80) {
      overallPerformanceAnalysis = "🏆 Rendimiento sobresaliente. Completas la gran mayoría de tus compromisos.";
    } else if (completionRate >= 60) {
      overallPerformanceAnalysis = "✅ Buen rendimiento general con espacio para optimización.";
    } else if (completionRate >= 40) {
      overallPerformanceAnalysis = "⚠️ Rendimiento por debajo del ideal. Necesitas ajustar tu planificación o ejecución.";
    } else {
      overallPerformanceAnalysis = "🚨 Rendimiento bajo. Hay una desconexión significativa entre planificación y ejecución.";
    }

    // Balance analysis
    let balanceAnalysis = "";
    const highImportanceGap = importanceBalance.highImportanceCompletionRate - importanceBalance.lowImportanceCompletionRate;
    
    if (highImportanceGap > 20) {
      balanceAnalysis = "✅ Excelente priorización: Completas significativamente más tareas importantes que las de baja prioridad.";
    } else if (highImportanceGap < -20) {
      balanceAnalysis = "⚠️ Priorización invertida: Completas más tareas de baja importancia que las críticas. Esto puede afectar tus objetivos a largo plazo.";
    } else {
      balanceAnalysis = "📊 Balance neutral: Completas tareas sin clara priorización por importancia.";
    }

    // Add urgency context
    if (urgencyBalance.earlyCompletionRate < 30 && urgencyBalance.lateCompletionRate > 40) {
      balanceAnalysis += " Trabajas principalmente bajo presión de tiempo, lo que puede causar estrés.";
    } else if (urgencyBalance.earlyCompletionRate > 50) {
      balanceAnalysis += " Completas tareas con anticipación, lo que reduce el estrés y mejora la calidad.";
    }

    // Efficiency analysis
    let efficiencyAnalysis = "";
    if (planningEfficiency !== null) {
      if (planningEfficiency > 1.5) {
        efficiencyAnalysis = "⚠️ Subestimas consistentemente el tiempo necesario. Las tareas consumen mucho más tiempo del planificado.";
      } else if (planningEfficiency > 1.1) {
        efficiencyAnalysis = "📊 Ligera subestimación del tiempo. Considera añadir un buffer del 20-30% a tus estimaciones.";
      } else if (planningEfficiency >= 0.9 && planningEfficiency <= 1.1) {
        efficiencyAnalysis = "🎯 Excelente precisión en la estimación de tiempos. Tus planes son realistas.";
      } else if (planningEfficiency < 0.9) {
        efficiencyAnalysis = "⏰ Sobreestimas el tiempo necesario. Puedes ser más optimista en tu planificación o estás siendo muy eficiente.";
      }
    } else {
      efficiencyAnalysis = "📊 No hay suficientes datos para analizar la eficiencia de planificación.";
    }

    // Generate recommendation
    let recommendation = "";
    if (completionRate < 50) {
      recommendation = "🎯 Prioridad: Reduce drásticamente tus compromisos. Es mejor hacer menos cosas bien que muchas mal.";
    } else if (highImportanceGap < -10) {
      recommendation = "⚡ Implementa la regla 'Lo importante primero': Bloquea las primeras 2 horas del día para tareas de alta importancia.";
    } else if (planningEfficiency && planningEfficiency > 1.3) {
      recommendation = "⏱️ Usa la técnica del 'time boxing' y registra tiempos reales para mejorar tus estimaciones futuras.";
    } else if (urgencyBalance.lateCompletionRate > 50) {
      recommendation = "🔥 Evita trabajar en modo crisis: Adelanta las fechas límite artificialmente o usa recordatorios más tempranos.";
    } else if (completionRate >= 75 && highImportanceGap > 15) {
      recommendation = "🌟 Tu sistema funciona bien. Mantén esta disciplina y considera compartir tu método con otros.";
    } else {
      recommendation = "📈 Revisa mensualmente estos KPIs para identificar tendencias y ajustar tu estrategia de productividad.";
    }

    return {
      overallPerformanceAnalysis,
      balanceAnalysis,
      efficiencyAnalysis,
      recommendation,
    };
  }
}

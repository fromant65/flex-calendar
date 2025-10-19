/**
 * Occurrence Stats Insights Generator
 */

import type { OccurrenceStatsData } from "~/types";

export class OccurrenceStatsInsightsGenerator {
  static generate(data: OccurrenceStatsData): {
    volumeAnalysis: string;
    evolutionAnalysis: string;
    statusDistributionAnalysis: string;
    recommendation: string;
  } {
    const { occurrencesByPeriod, statusDistribution } = data;

    // Analyze volume evolution
    let volumeEvolution: "increasing" | "decreasing" | "stable" = "stable";
    if (occurrencesByPeriod.length >= 3) {
      const recent = occurrencesByPeriod.slice(-2).reduce((sum, p) => sum + p.count, 0) / 2;
      const older = occurrencesByPeriod.slice(0, 2).reduce((sum, p) => sum + p.count, 0) / 2;
      const difference = recent - older;
      const percentChange = older > 0 ? (difference / older) * 100 : 0;
      
      if (percentChange > 20) volumeEvolution = "increasing";
      else if (percentChange < -20) volumeEvolution = "decreasing";
    }

    // Analyze status distribution
    const total = statusDistribution.completed + statusDistribution.pending + 
                  statusDistribution.inProgress + statusDistribution.skipped;
    const completedRate = total > 0 ? (statusDistribution.completed / total) * 100 : 0;
    const skippedRate = total > 0 ? (statusDistribution.skipped / total) * 100 : 0;
    const pendingRate = total > 0 ? (statusDistribution.pending / total) * 100 : 0;

    // Generate analyses
    let volumeAnalysis = "";
    if (volumeEvolution === "increasing") {
      volumeAnalysis = "📈 La cantidad de ocurrencias está aumentando. Estás generando más instancias de tareas con el tiempo.";
    } else if (volumeEvolution === "decreasing") {
      volumeAnalysis = "📉 La cantidad de ocurrencias está disminuyendo. Estás generando menos instancias de tareas.";
    } else {
      volumeAnalysis = "➡️ La cantidad de ocurrencias se mantiene estable en el tiempo.";
    }

    let evolutionAnalysis = "";
    if (volumeEvolution === "increasing" && completedRate < 60) {
      evolutionAnalysis = "⚠️ El aumento en la carga de trabajo está superando tu capacidad de completación. Esto puede llevar al agobio.";
    } else if (volumeEvolution === "increasing" && completedRate >= 70) {
      evolutionAnalysis = "✅ Estás manejando bien el aumento en la carga de trabajo, manteniendo una buena tasa de completación.";
    } else if (volumeEvolution === "decreasing" && completedRate >= 70) {
      evolutionAnalysis = "🎯 La reducción en la carga te permite mantener alta calidad en la completación. Balance saludable.";
    } else if (volumeEvolution === "decreasing" && completedRate < 50) {
      evolutionAnalysis = "⚠️ Aunque hay menos ocurrencias, la tasa de completación sigue baja. El problema no es solo el volumen.";
    } else {
      evolutionAnalysis = "📊 El volumen estable te permite establecer un ritmo predecible de trabajo.";
    }

    let statusDistributionAnalysis = "";
    if (skippedRate > 20) {
      statusDistributionAnalysis = `🚫 Alto porcentaje de ocurrencias omitidas (${skippedRate.toFixed(1)}%). Esto indica tareas poco realistas o pérdida de motivación.`;
    } else if (pendingRate > 40) {
      statusDistributionAnalysis = `⏳ Gran acumulación de ocurrencias pendientes (${pendingRate.toFixed(1)}%). Hay un cuello de botella en tu flujo de trabajo.`;
    } else if (completedRate >= 70) {
      statusDistributionAnalysis = `✅ Excelente distribución: ${completedRate.toFixed(1)}% completadas. Mantenes un flujo de trabajo efectivo.`;
    } else {
      statusDistributionAnalysis = `📊 Distribución de estados: ${completedRate.toFixed(1)}% completadas, ${pendingRate.toFixed(1)}% pendientes, ${skippedRate.toFixed(1)}% omitidas.`;
    }

    let recommendation = "";
    if (skippedRate > 20) {
      recommendation = "🔍 Revisa las tareas que omites frecuentemente. Considera eliminarlas, redefinirlas o reducir su frecuencia. No todas las tareas merecen tu tiempo.";
    } else if (volumeEvolution === "increasing" && completedRate < 60) {
      recommendation = "⚡ Pausa la creación de nuevas tareas recurrentes. Enfócate en completar el backlog existente antes de añadir más compromisos.";
    } else if (pendingRate > 40 && volumeEvolution !== "decreasing") {
      recommendation = "🎯 Implementa una 'semana de limpieza': dedica tiempo exclusivo a resolver pendientes sin generar nuevas ocurrencias.";
    } else if (completedRate >= 75 && volumeEvolution === "stable") {
      recommendation = "🌟 Tienes un sistema bien equilibrado. Puedes considerar añadir nuevos desafíos o proyectos más ambiciosos.";
    } else {
      recommendation = "📝 Monitorea semanalmente tu ratio de completación vs generación de ocurrencias para mantener el balance.";
    }

    return {
      volumeAnalysis,
      evolutionAnalysis,
      statusDistributionAnalysis,
      recommendation,
    };
  }
}

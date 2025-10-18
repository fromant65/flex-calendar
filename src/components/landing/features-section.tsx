"use client"

import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  LayoutGrid, 
  Repeat, 
  Target,
  Palette,
  BarChart3,
  Zap
} from "lucide-react"
import { FeatureCard } from "./feature-card"
import { SparkleCalendarBgSubtle } from "./sparkle-calendar-bg-subtle"

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <SparkleCalendarBgSubtle opacity={0.12} />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Características Destacadas
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas poderosas para optimizar tu productividad
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <FeatureCard
            icon={LayoutGrid}
            title="Matriz de Tareas"
            description="Visualiza y prioriza tus tareas según urgencia e importancia en cuatro cuadrantes intuitivos."
            index={0}
          />
          <FeatureCard
            icon={Calendar}
            title="Vista de Calendario"
            description="Calendario interactivo con vistas diaria, semanal y mensual. Arrastra y suelta eventos fácilmente para organizar tu tiempo."
            index={1}
          />
          <FeatureCard
            icon={Clock}
            title="Timeline Visual"
            description="Visualiza todas tus ocurrencias en una línea de tiempo dinámica y ajustable."
            index={2}
          />
          <FeatureCard
            icon={Target}
            title="Tareas Flexibles"
            description="Define tareas objetivo con fechas límite o tareas únicas fijas con horarios específicos."
            index={3}
          />
          <FeatureCard
            icon={Repeat}
            title="Recurrencia Inteligente"
            description="Crea patrones de repetición por días de la semana o del mes con límites personalizables."
            index={4}
          />
          <FeatureCard
            icon={Palette}
            title="Interfaz Intuitiva"
            description="Diseño moderno y responsive que se adapta a todos tus dispositivos con tema claro y oscuro."
            index={5}
          />
          <FeatureCard
            icon={BarChart3}
            title="Estadisticas Detalladas"
            description="Visualiza el rendimiento de tu tiempo con informes detallados y gráficos."
            index={6}
          />
          <FeatureCard
            icon={Zap}
            title="Cálculo automático de urgencia"
            description="El sistema ajusta automáticamente la urgencia de tus tareas basándose en fechas objetivo y límite."
            index={7}
          />
        </div>
      </div>
    </section>
  )
}

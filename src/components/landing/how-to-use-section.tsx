"use client"

import { motion } from "framer-motion"
import { StepCard } from "./step-card"
import { LandingHelpNote } from "./landing-help-note"

export function HowToUseSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Cómo Empezar
          </h2>
          <p className="text-lg text-muted-foreground">
            Sigue estos pasos para comenzar a organizar tu tiempo eficientemente
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-6">
          <StepCard
            number={1}
            title="Crea tus Tareas"
            description="Define tus actividades desde la sección de Tareas. Elige si son únicas o repetitivas, fijas o flexibles, asigna su nivel de importancia y establece fechas objetivo o límite según tus necesidades."
            index={0}
          />
          <StepCard
            number={2}
            title="Organiza en la Matriz"
            description="Visualiza todas tus tareas en la Matriz de Tareas. Identifica rápidamente qué es urgente e importante para priorizar mejor tu tiempo."
            index={1}
          />
          <StepCard
            number={3}
            title="Programa tus Eventos"
            description="Desde el Calendario, haz clic en cualquier espacio de tiempo para crear eventos. El sistema te sugerirá ocurrencias pendientes basándose en tus prioridades."
            index={2}
          />
          <StepCard
            number={4}
            title="Gestiona Ocurrencias"
            description="En el Task Manager, visualiza todas las ocurrencias generadas. Edita, reprograma o marca como completadas las instancias específicas de tus tareas."
            index={3}
          />
          <StepCard
            number={5}
            title="Visualiza tu Progreso"
            description="Usa el Timeline para ver una vista panorámica de todas tus ocurrencias a lo largo del tiempo. Ajusta el zoom para diferentes perspectivas temporales."
            index={4}
          />
          <StepCard
            number={6}
            title="Analiza tu Desempeño"
            description="Utiliza la página de estadísticas para revisar tu productividad. Observa patrones, identifica áreas de mejora y ajusta tus estrategias de gestión del tiempo."
            index={5}
          />
        </div>
        {/* Small help note about tooltips/help page (moved to the end of the steps) */}
        <LandingHelpNote />
      </div>
    </section>
  )
}

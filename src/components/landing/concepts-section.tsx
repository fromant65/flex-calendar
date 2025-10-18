"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Repeat, Calendar } from "lucide-react"
import { FeatureCard } from "./feature-card"

export function ConceptsSection() {
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
            Conceptos Fundamentales
          </h2>
          <p className="text-lg text-muted-foreground">
            Entiende cómo Flex Calendar estructura tu tiempo en tres niveles
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <FeatureCard
            icon={CheckCircle2}
            title="Tareas"
            description="Define tus actividades y objetivos. Cada tarea puede ser única o repetitiva, ser fija en el tiempo o flexible, repetirse hasta una fecha definida o indefinidamente."
            index={0}
          />
          <FeatureCard
            icon={Repeat}
            title="Ocurrencias"
            description="Instancias específicas de tus tareas. Las tareas repetitivas generan múltiples ocurrencias según su patrón de recurrencia."
            index={1}
          />
          <FeatureCard
            icon={Calendar}
            title="Eventos"
            description="Representaciones concretas en el calendario. Cada ocurrencia puede tener uno o más eventos asignados con fecha y hora específicas."
            index={2}
          />
        </div>
      </div>
    </section>
  )
}

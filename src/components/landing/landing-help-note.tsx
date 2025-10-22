"use client"

import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"

export function LandingHelpNote() {
  return (
    <motion.aside
      aria-label="Nota de ayuda"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl mt-12"
    >
      <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg cursor-default">
        {/* Sparkle effect on hover */}
        <motion.div
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary opacity-0 group-hover:opacity-100"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
          }}
        />
        
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-foreground">¿Necesitas ayuda?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Esta aplicación incluye una página de ayuda completa y tooltips contextuales en toda la interfaz.
              Usa el icono de ayuda en la cabecera de cada sección para ver explicaciones rápidas sobre colores, acciones y comportamiento.
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default LandingHelpNote

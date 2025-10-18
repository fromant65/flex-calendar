"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap } from "lucide-react"
import { Button } from "~/components/ui/button"
import { SparkleCalendarBg } from "./sparkle-calendar-bg"

interface HeroSectionProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export function HeroSection({ onLoginClick, onRegisterClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <SparkleCalendarBg />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary cursor-default"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4" />
            Sistema Inteligente de Gestión del Tiempo
          </motion.div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Organiza tu vida con{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Flex Calendar
            </span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            La aplicación que transforma tareas en eventos, prioriza lo importante 
            y te ayuda a alcanzar tus metas de manera flexible e inteligente.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={onRegisterClick}
              className="w-full sm:w-auto rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg cursor-pointer"
            >
              <Zap className="mr-2 h-5 w-5" />
              Comenzar Gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLoginClick}
              className="w-full sm:w-auto rounded-xl text-base font-semibold cursor-pointer"
            >
              Iniciar Sesión
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

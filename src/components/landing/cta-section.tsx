"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "~/components/ui/button"

interface CTASectionProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export function CTASection({ onLoginClick, onRegisterClick }: CTASectionProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative sparkles */}
          <motion.div
            className="absolute top-4 left-8 h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute top-12 right-12 h-3 w-3 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-8 left-16 h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: 1,
              repeat: Infinity,
            }}
          />

          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            ¿Listo para transformar tu productividad?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Únete a Flex Calendar y comienza a gestionar tu tiempo de manera inteligente y flexible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onRegisterClick}
              className="w-full sm:w-auto rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg cursor-pointer"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Crear Cuenta Gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onLoginClick}
              className="w-full sm:w-auto rounded-xl text-base font-semibold cursor-pointer"
            >
              Ya tengo cuenta
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

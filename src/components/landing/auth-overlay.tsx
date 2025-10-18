"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "~/components/ui/button"

interface AuthOverlayProps {
  isOpen: boolean
  mode: "login" | "register"
  onClose: () => void
  onSwitchMode: () => void
  children: React.ReactNode
}

export function AuthOverlay({ isOpen, mode, onClose, onSwitchMode, children }: AuthOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div 
              className="relative w-full max-w-md rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 p-8 sm:p-10 shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative sparkles background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              
              {/* Animated sparkle decorations */}
              <motion.div
                className="absolute top-6 right-6 w-2 h-2 rounded-full bg-primary/60"
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
                className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-primary/40"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute bottom-8 right-12 w-1.5 h-1.5 rounded-full bg-primary/40"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: 1,
                  repeat: Infinity,
                }}
              />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 h-9 w-9 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Header */}
              <div className="mb-8 relative">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-extrabold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mode === "login" 
                      ? "Inicia sesión para continuar organizando tu tiempo" 
                      : "Únete a Flex Calendar y comienza a gestionar tu tiempo de forma inteligente"}
                  </p>
                </motion.div>
              </div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>

              {/* Switch mode */}
              <motion.div
                className="mt-8 text-center text-sm text-muted-foreground relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <button
                  onClick={onSwitchMode}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer relative group"
                >
                  {mode === "login" ? "Regístrate" : "Inicia sesión"}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

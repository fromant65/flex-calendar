"use client"

import { motion } from "framer-motion"

interface StepCardProps {
  number: number
  title: string
  description: string
  index: number
}

export function StepCard({ number, title, description, index }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      className="relative flex gap-4 cursor-default"
    >
      {/* Number badge */}
      <div className="relative flex-shrink-0">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-lg cursor-default"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {number}
        </motion.div>
        
        {/* Sparkle */}
        <motion.div
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            delay: index * 0.2,
            duration: 1.2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

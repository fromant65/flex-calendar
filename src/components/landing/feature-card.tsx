"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative h-full"
    >
      <div className="relative h-full flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg cursor-default">
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
        
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {title}
        </h3>
        
        <p className="text-sm leading-relaxed text-muted-foreground flex-1">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

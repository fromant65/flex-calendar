/**
 * InsightsModal - Modal component for displaying detailed insights analysis
 */

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { FileText } from "lucide-react"
import { InsightCard } from "./insight-card"

interface InsightsModalProps {
  title: string
  description?: string
  insights: Array<{
    title?: string
    message: string
    type?: "info" | "success" | "warning" | "recommendation"
  }>
  triggerText?: string
}

export function InsightsModal({
  title,
  description,
  insights,
  triggerText = "Ver análisis detallado",
}: InsightsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm text-primary hover:underline cursor-pointer">
          <FileText className="h-3.5 w-3.5 mr-1" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              message={insight.message}
              type={insight.type}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { DialogHeader, DialogTitle } from "~/components/ui/dialog"

export function ModalHeader({ title }: { title: string }) {
  return (
    <DialogHeader className="border-b border-border pb-4">
      <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
    </DialogHeader>
  )
}

export default ModalHeader

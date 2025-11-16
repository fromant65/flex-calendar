"use client"

import React from "react"
import { InstallBenefitsContent } from "./install/benefits"
import { InstallStepsContent } from "./install/steps"
import { InstallContent as InstallMainContent } from "./events/install"

interface InstallContentProps {
  id: string
}

export function InstallContent({ id }: InstallContentProps) {
  switch (id) {
    case "install":
      return <InstallMainContent />
    case "install-benefits":
      return <InstallBenefitsContent />
    case "install-steps":
      return <InstallStepsContent />
    default:
      return null
  }
}

"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"

interface LogoutButtonProps {
  className?: string
  variant?: "icon" | "full"
}

export function LogoutButton({ className, variant = "icon" }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" })
  }

  if (variant === "full") {
    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setShowConfirm(true)}
          className={className}
          size="default"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </Button>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>Cerrar sesión</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowConfirm(true)}
        className={className}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Cerrar sesión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

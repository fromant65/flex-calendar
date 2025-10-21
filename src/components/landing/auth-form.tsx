"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      setError("")
      toast.success("Cuenta creada", { description: "Ya puedes iniciar sesión" })
      await handleLogin()
    },
    onError: (error) => {
      setError(error.message)
      toast.error("Error al crear cuenta", { description: error.message || "No se pudo crear la cuenta" })
    },
  })

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email o contraseña incorrectos")
      toast.error("Error al iniciar sesión", { description: "Email o contraseña incorrectos" })
    } else {
      router.push("/dashboard")
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError("")

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
    } catch (err) {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === "login") {
      await handleLogin()
    } else {
      await handleRegister()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "register" && (
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-foreground">
            Nombre completo
          </label>
          <div className="relative group">
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-xl border-2 border-border bg-background/50 px-4 py-3.5 text-foreground placeholder-muted-foreground/60 outline-none transition-all focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/5 cursor-text hover:border-border/80"
              placeholder="Ingresa tu nombre"
              required={mode === "register"}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Correo electrónico
        </label>
        <div className="relative group">
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-xl border-2 border-border bg-background/50 px-4 py-3.5 text-foreground placeholder-muted-foreground/60 outline-none transition-all focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/5 cursor-text hover:border-border/80"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">
          Contraseña
        </label>
        <div className="relative group">
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full rounded-xl border-2 border-border bg-background/50 px-4 py-3.5 text-foreground placeholder-muted-foreground/60 outline-none transition-all focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/5 cursor-text hover:border-border/80"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        {mode === "register" && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Debe tener al menos 6 caracteres
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2 animate-in slide-in-from-top-2">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/95 hover:to-primary/80 font-bold text-base py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading
            ? "Procesando..."
            : mode === "login"
              ? "Iniciar Sesión"
              : "Crear Cuenta"}
        </span>
        {!loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </Button>
    </form>
  )
}

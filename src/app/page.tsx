"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      // Después de registrar, hacer login automáticamente
      setError("");
      await handleLogin();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Flex <span className="text-[hsl(280,100%,70%)]">Calendar</span>
        </h1>

        <div className="w-full max-w-md rounded-xl bg-white/10 p-8 backdrop-blur-sm">
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 font-semibold transition-colors ${
                isLogin
                  ? "bg-[hsl(280,100%,70%)] text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 font-semibold transition-colors ${
                !isLogin
                  ? "bg-[hsl(280,100%,70%)] text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/50 outline-none ring-2 ring-white/10 transition-all focus:ring-[hsl(280,100%,70%)]"
                  placeholder="Tu nombre"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/50 outline-none ring-2 ring-white/10 transition-all focus:ring-[hsl(280,100%,70%)]"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/50 outline-none ring-2 ring-white/10 transition-all focus:ring-[hsl(280,100%,70%)]"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[hsl(280,100%,70%)] px-4 py-3 font-semibold text-white transition-colors hover:bg-[hsl(280,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Cargando..."
                : isLogin
                  ? "Iniciar Sesión"
                  : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-semibold text-[hsl(280,100%,70%)] hover:underline"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </div>
        </div>

        <p className="text-sm text-white/40">
          Sistema de gestión de tareas con calendario integrado
        </p>
      </div>
    </main>
  );
}

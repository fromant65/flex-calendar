import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { signOut } from "~/server/auth";

async function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-red-500/20 px-4 py-2 font-semibold text-red-200 transition-colors hover:bg-red-500/30"
      >
        Cerrar Sesión
      </button>
    </form>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">
              Bienvenido, <span className="text-[hsl(280,100%,70%)]">{session.user.name}</span>
            </h1>
            <p className="mt-2 text-white/60">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-white/60">Tareas Pendientes</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-white/60">Tareas Completadas</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-white/60">Racha Actual</h3>
            <p className="mt-2 text-3xl font-bold">0 días</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tareas Urgentes */}
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold">Tareas Urgentes</h2>
            <div className="space-y-3">
              <p className="text-center text-white/40 py-8">
                No hay tareas urgentes
              </p>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold">Próximos Eventos</h2>
            <div className="space-y-3">
              <p className="text-center text-white/40 py-8">
                No hay eventos próximos
              </p>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 rounded-xl bg-[hsl(280,100%,70%)]/20 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-bold">🎉 ¡Autenticación Funcionando!</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Usuario autenticado correctamente</p>
            <p>✅ Middleware protegiendo rutas</p>
            <p>✅ Sesión JWT activa</p>
            <p className="mt-4 font-mono text-xs text-white/60">
              User ID: {session.user.id}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="rounded-lg bg-white/10 p-4 text-left transition-colors hover:bg-white/20">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">Nueva Tarea</div>
            <div className="text-xs text-white/60">Crear tarea</div>
          </button>
          
          <button className="rounded-lg bg-white/10 p-4 text-left transition-colors hover:bg-white/20">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Evento</div>
            <div className="text-xs text-white/60">Agregar evento</div>
          </button>
          
          <button className="rounded-lg bg-white/10 p-4 text-left transition-colors hover:bg-white/20">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold">Hábito</div>
            <div className="text-xs text-white/60">Crear hábito</div>
          </button>
          
          <button className="rounded-lg bg-white/10 p-4 text-left transition-colors hover:bg-white/20">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Estadísticas</div>
            <div className="text-xs text-white/60">Ver análisis</div>
          </button>
        </div>
      </div>
    </main>
  );
}

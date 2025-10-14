import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-foreground">
            Bienvenido, <span className="text-primary">{session.user.name}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">{session.user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground">Tareas Pendientes</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground">Tareas Completadas</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground">Racha Actual</h3>
            <p className="mt-2 text-3xl font-bold text-foreground">0 días</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tareas Urgentes */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Tareas Urgentes</h2>
            <div className="space-y-3">
              <p className="text-center text-muted-foreground py-8">
                No hay tareas urgentes
              </p>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Próximos Eventos</h2>
            <div className="space-y-3">
              <p className="text-center text-muted-foreground py-8">
                No hay eventos próximos
              </p>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">🎉 ¡Autenticación Funcionando!</h2>
          <div className="space-y-2 text-sm text-foreground">
            <p>✅ Usuario autenticado correctamente</p>
            <p>✅ Middleware protegiendo rutas</p>
            <p>✅ Sesión JWT activa</p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              User ID: {session.user.id}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <button className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 hover:shadow-md">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold text-foreground">Nueva Tarea</div>
            <div className="text-xs text-muted-foreground">Crear tarea</div>
          </button>
          
          <button className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 hover:shadow-md">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold text-foreground">Evento</div>
            <div className="text-xs text-muted-foreground">Agregar evento</div>
          </button>
          
          <button className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 hover:shadow-md">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold text-foreground">Hábito</div>
            <div className="text-xs text-muted-foreground">Crear hábito</div>
          </button>
          
          <button className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 hover:shadow-md">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-foreground">Estadísticas</div>
            <div className="text-xs text-muted-foreground">Ver análisis</div>
          </button>
        </div>
      </div>
    </main>
  );
}

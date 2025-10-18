import { auth } from "~/server/auth";
import { DashboardClient } from "~/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  // El middleware ya maneja la redirección si no hay sesión
  // Solo necesitamos obtener los datos de la sesión
  if (!session) {
    return null; // Esto no debería ocurrir por el middleware, pero por seguridad
  }

  return (
    <DashboardClient 
      userName={session.user.name ?? "Usuario"} 
      userEmail={session.user.email ?? ""} 
    />
  );
}

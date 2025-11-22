import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, ListChecks, Calendar, CheckCircle2 } from "lucide-react";

interface AllUsersTableProps {
  allUsersWithStats:
    | Array<{
        id: string;
        name: string | null;
        email: string;
        role: string | null;
        totalTasks: number;
        totalOccurrences: number;
        totalEvents: number;
      }>
    | undefined;
  isLoading: boolean;
}

export function AllUsersTable({ allUsersWithStats, isLoading }: AllUsersTableProps) {
  // Calcular totales
  const totalUsers = allUsersWithStats?.length ?? 0;
  const totalTasks = allUsersWithStats?.reduce((sum, user) => sum + user.totalTasks, 0) ?? 0;
  const totalOccurrences = allUsersWithStats?.reduce((sum, user) => sum + user.totalOccurrences, 0) ?? 0;
  const totalEvents = allUsersWithStats?.reduce((sum, user) => sum + user.totalEvents, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos los Usuarios</CardTitle>
        <CardDescription>
          Lista completa de usuarios registrados con sus estadísticas totales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de estadísticas */}
        {!isLoading && allUsersWithStats && allUsersWithStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Usuarios</p>
                <p className="text-lg font-semibold">{totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Tareas</p>
                <p className="text-lg font-semibold">{totalTasks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <ListChecks className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Ocurrencias</p>
                <p className="text-lg font-semibold">{totalOccurrences}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Eventos</p>
                <p className="text-lg font-semibold">{totalEvents}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : allUsersWithStats && allUsersWithStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Usuario</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Rol</th>
                  <th className="text-right py-2 px-4">Total Tareas</th>
                  <th className="text-right py-2 px-4">Total Ocurrencias</th>
                  <th className="text-right py-2 px-4">Total Eventos</th>
                </tr>
              </thead>
              <tbody>
                {allUsersWithStats.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{user.name ?? "Sin nombre"}</td>
                    <td className="py-2 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-2 px-4">
                      {user.role ? (
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {user.role}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Usuario</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">{user.totalTasks}</td>
                    <td className="py-2 px-4 text-right">{user.totalOccurrences}</td>
                    <td className="py-2 px-4 text-right">{user.totalEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, ListChecks, Calendar } from "lucide-react";

interface UserActivityTableProps {
  userActivityStats:
    | Array<{
        userId: string;
        userName: string | null;
        userEmail: string;
        tasksCreated: number;
        occurrencesCompleted: number;
        eventsCompleted: number;
      }>
    | undefined;
  isLoading: boolean;
}

export function UserActivityTable({ userActivityStats, isLoading }: UserActivityTableProps) {
  // Calcular totales
  const totalUsers = userActivityStats?.length ?? 0;
  const totalTasks = userActivityStats?.reduce((sum, user) => sum + user.tasksCreated, 0) ?? 0;
  const totalOccurrences = userActivityStats?.reduce((sum, user) => sum + user.occurrencesCompleted, 0) ?? 0;
  const totalEvents = userActivityStats?.reduce((sum, user) => sum + user.eventsCompleted, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios con Actividad en el Período</CardTitle>
        <CardDescription>
          Lista de usuarios que tuvieron actividad en el rango de fechas seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de estadísticas */}
        {!isLoading && userActivityStats && userActivityStats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Usuarios</p>
                <p className="text-lg font-semibold">{totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <ListChecks className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Tareas Creadas</p>
                <p className="text-lg font-semibold">{totalTasks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <ListChecks className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Ocurrencias</p>
                <p className="text-lg font-semibold">{totalOccurrences}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Eventos</p>
                <p className="text-lg font-semibold">{totalEvents}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : userActivityStats && userActivityStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Usuario</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-right py-2 px-4">Tareas Creadas</th>
                  <th className="text-right py-2 px-4">Ocurrencias Completadas</th>
                  <th className="text-right py-2 px-4">Eventos Completados</th>
                </tr>
              </thead>
              <tbody>
                {userActivityStats.map((user) => (
                  <tr key={user.userId} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{user.userName ?? "Sin nombre"}</td>
                    <td className="py-2 px-4 text-muted-foreground">{user.userEmail}</td>
                    <td className="py-2 px-4 text-right">{user.tasksCreated}</td>
                    <td className="py-2 px-4 text-right">{user.occurrencesCompleted}</td>
                    <td className="py-2 px-4 text-right">{user.eventsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay usuarios con actividad en este período
          </div>
        )}
      </CardContent>
    </Card>
  );
}

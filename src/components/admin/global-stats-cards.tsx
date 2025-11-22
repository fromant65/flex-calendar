import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, CheckCircle, ListTodo, Calendar } from "lucide-react";

interface GlobalStatsCardsProps {
  globalStats: {
    totalTasksCreated: number;
    totalOccurrencesCreated: number;
    totalEventsCreated: number;
    totalOccurrencesCompleted: number;
    totalEventsCompleted: number;
  } | undefined;
  userCounts: {
    totalUsers: number;
    activeUsers: number;
  } | undefined;
  isLoading: boolean;
}

export function GlobalStatsCards({ globalStats, userCounts, isLoading }: GlobalStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : userCounts?.totalUsers ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : userCounts?.activeUsers ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Último mes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Creadas</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : globalStats?.totalTasksCreated ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ocurrencias Creadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : globalStats?.totalOccurrencesCreated ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Creados</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : globalStats?.totalEventsCreated ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ocurrencias Completadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : globalStats?.totalOccurrencesCompleted ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Completados</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : globalStats?.totalEventsCompleted ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </CardContent>
      </Card>
    </div>
  );
}

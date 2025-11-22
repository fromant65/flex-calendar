import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function NotificationsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Centro de Notificaciones</CardTitle>
        <CardDescription>Esta sección está en desarrollo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Próximamente</p>
            <p className="text-sm">
              La funcionalidad de notificaciones estará disponible en una futura actualización
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
